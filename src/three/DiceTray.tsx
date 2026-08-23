/**
 * Two 3D dice in a felt tray, rendered with plain three.js.
 *
 * White die = loadout cost cap. Red die = attachment cost cap.
 *
 * Like the roulette wheel, the throw is choreographed rather than simulated:
 * the caller decides both values (seeded, so a run is reproducible) and the
 * dice tumble their way to showing exactly those faces.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { frameCamera } from './frame';
import { animMs } from '../engine/settings';
import { renderLoop } from './renderLoop';

export interface DiceHandle {
  /** Tumble to `a` on the white die and `b` on the red. Resolves when settled. */
  roll: (a: number, b: number) => Promise<void>;
}

interface Props {
  className?: string;
  /** Fired on each felt contact. `strength` decays 1 → 0 across the bounces. */
  onBounce?: (strength: number) => void;
  /** Fired once both dice have come to rest. */
  onSettle?: () => void;
}

const DIE = 1.15;
const FLOOR = DIE / 2;
const ROLL_MS = 2300;

/* --- tray dimensions, also used to frame the camera --------------------- */
const TRAY_W = 9; // felt, x
const TRAY_D = 6.4; // felt, z
const RAIL_T = 0.5;
const HALF_X = TRAY_W / 2 + RAIL_T + 0.15;
const HALF_Z = TRAY_D / 2 + RAIL_T + 0.15;
/** Tallest thing standing on the felt that must stay in frame. */
const TRAY_RELIEF = 1.8;
const CAM_TILT = (34 * Math.PI) / 180; // from straight down
const CAM_FOV = 40;
/** Fraction of the throw spent tumbling before the dice orient themselves. */
const TUMBLE = 0.68;

/**
 * BoxGeometry material order is [+X, -X, +Y, -Y, +Z, -Z]. Laid out so opposite
 * faces sum to 7, like a real die.
 */
const FACE_VALUES = [3, 4, 1, 6, 2, 5];

/** Which way a given value faces in the die's local space. */
const FACE_NORMALS: Record<number, THREE.Vector3> = {
  1: new THREE.Vector3(0, 1, 0),
  6: new THREE.Vector3(0, -1, 0),
  2: new THREE.Vector3(0, 0, 1),
  5: new THREE.Vector3(0, 0, -1),
  3: new THREE.Vector3(1, 0, 0),
  4: new THREE.Vector3(-1, 0, 0),
};

/** Pip layout per value, in a -1..1 grid. */
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-0.5, -0.5],
    [0.5, 0.5],
  ],
  3: [
    [-0.55, -0.55],
    [0, 0],
    [0.55, 0.55],
  ],
  4: [
    [-0.5, -0.5],
    [0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
  ],
  5: [
    [-0.55, -0.55],
    [0.55, -0.55],
    [0, 0],
    [-0.55, 0.55],
    [0.55, 0.55],
  ],
  6: [
    [-0.5, -0.6],
    [-0.5, 0],
    [-0.5, 0.6],
    [0.5, -0.6],
    [0.5, 0],
    [0.5, 0.6],
  ],
};

function faceTexture(value: number, body: string, pip: string): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = body;
  ctx.fillRect(0, 0, S, S);

  // Soft inner vignette so the faces don't read as flat colour.
  const grad = ctx.createRadialGradient(S * 0.38, S * 0.32, S * 0.05, S / 2, S / 2, S * 0.78);
  grad.addColorStop(0, 'rgba(255,255,255,0.30)');
  grad.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  const r = S * 0.088;
  ctx.fillStyle = pip;
  for (const [px, py] of PIPS[value] ?? []) {
    ctx.beginPath();
    ctx.arc(S / 2 + (px * S) / 2.9, S / 2 + (py * S) / 2.9, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

function buildDie(body: string, pip: string) {
  const geo = new THREE.BoxGeometry(DIE, DIE, DIE, 4, 4, 4);
  const textures = FACE_VALUES.map((v) => faceTexture(v, body, pip));
  // Physical + clearcoat gives the lacquered casino-chip sheen that plain
  // standard material can't: a tight specular highlight over a matte body.
  const mats = textures.map(
    (map) =>
      new THREE.MeshPhysicalMaterial({
        map,
        roughness: 0.22,
        metalness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        reflectivity: 0.6,
        envMapIntensity: 1.1,
      }),
  );
  const mesh = new THREE.Mesh(geo, mats);
  mesh.castShadow = true;
  return {
    mesh,
    dispose: () => {
      geo.dispose();
      textures.forEach((t) => t.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}

/** Orientation that puts `value` face-up, with an arbitrary spin about Y. */
function faceUpQuaternion(value: number, spin: number): THREE.Quaternion {
  const align = new THREE.Quaternion().setFromUnitVectors(
    FACE_NORMALS[value] ?? FACE_NORMALS[1],
    new THREE.Vector3(0, 1, 0),
  );
  const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin);
  return yaw.multiply(align);
}

const easeOutCubic = (u: number) => 1 - Math.pow(1 - u, 3);
const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);

/** Sliding to a halt under friction — fast entry, long soft settle. */
const easeFriction = (u: number) => (1 - Math.exp(-3.6 * u)) / (1 - Math.exp(-3.6));

/**
 * Decaying parabolic hops. Each bounce reaches `restitution` of the previous
 * height and, as with a real die, its flight time shrinks by sqrt(restitution)
 * — so the hops crowd together at the end instead of pulsing evenly.
 */
function bounceEnvelope(
  u: number,
  arcs = 6,
  restitution = 0.36,
): { h: number; arc: number } {
  if (u <= 0) return { h: 0, arc: -1 };
  if (u >= 1) return { h: 0, arc: arcs };
  const k = Math.sqrt(restitution);
  const durations: number[] = [];
  let total = 0;
  for (let i = 0; i < arcs; i++) {
    const d = Math.pow(k, i);
    durations.push(d);
    total += d;
  }
  let acc = 0;
  for (let i = 0; i < arcs; i++) {
    const d = durations[i] / total;
    if (u < acc + d) {
      const local = (u - acc) / d;
      return { h: Math.pow(restitution, i) * 4 * local * (1 - local), arc: i };
    }
    acc += d;
  }
  return { h: 0, arc: arcs };
}

export const DiceTray = forwardRef<DiceHandle, Props>(function DiceTray(
  { className, onBounce, onSettle },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ roll: (a: number, b: number) => Promise<void> } | null>(null);
  const cb = useRef({ onBounce, onSettle });
  cb.current = { onBounce, onSettle };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /*
     * Re-read on every run, not captured at mount.
     *
     * The speed control is a live setting: the scene is built once and lives
     * for the life of the page, so a length taken here and kept would pin the
     * stage to whatever the slider said the first time it rendered. Reading it
     * as each sequence starts means the control works without a reload, and
     * the value still holds steady for the run it governs.
     */
    /*
     * Full written length, whatever the system preference says.
     *
     * This used to fall back to a much shorter figure under prefers-reduced-
     * motion, which made the length control scale a stage that had already
     * been cut to a fraction behind the user's back. The preference now picks
     * the DEFAULT on the slider instead, so it is honoured once, visibly, in a
     * place that can be overridden.
     */
    let duration = animMs(ROLL_MS);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15; // matched to the roulette scene
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 100);
    camera.position.set(0, 7.2, 5.4);
    camera.lookAt(0, 0, 0);

    // Same light rig as the roulette scene — cool ambient, warm key from the
    // upper left, warm and cool point lights for the casino-floor bounce — so
    // the two canvases read as one room.
    scene.add(new THREE.AmbientLight(0x8899bb, 1.05));

    const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
    key.position.set(-5, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    scene.add(key);

    const warm = new THREE.PointLight(0xffb056, 55, 24, 2);
    warm.position.set(3.6, 4.2, -1.5);
    scene.add(warm);

    const cool = new THREE.PointLight(0x5f8dff, 34, 24, 2);
    cool.position.set(-4, 3.4, -3.5);
    scene.add(cool);

    // --- tray -----------------------------------------------------------
    const trash: (THREE.BufferGeometry | THREE.Material)[] = [];
    const feltGeo = new THREE.BoxGeometry(9, 0.4, 6.4);
    // Darker felt than a real table: it has to sit beside the roulette bowl
    // without looking like a brighter, separate scene.
    const feltMat = new THREE.MeshStandardMaterial({ color: 0x0e3a2c, roughness: 0.96 });
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.position.y = -0.2;
    felt.receiveShadow = true;
    scene.add(felt);
    trash.push(feltGeo, feltMat);

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x3b2718,
      roughness: 0.55,
      metalness: 0.25,
    });
    trash.push(railMat);
    const rails: [number, number, number, number, number][] = [
      [9.6, 0.55, 0.5, 0, -3.45],
      [9.6, 0.55, 0.5, 0, 3.45],
      [0.5, 0.55, 6.4, -4.55, 0],
      [0.5, 0.55, 6.4, 4.55, 0],
    ];
    // Brass capping on the rails, echoing the roulette bowl's rim.
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.26,
      metalness: 1,
    });
    trash.push(brassMat);

    for (const [w, h, d, x, z] of rails) {
      const g = new THREE.BoxGeometry(w, h, d);
      const rail = new THREE.Mesh(g, railMat);
      rail.position.set(x, 0.08, z);
      rail.castShadow = true;
      rail.receiveShadow = true;
      scene.add(rail);
      trash.push(g);

      const capGeo = new THREE.BoxGeometry(w * 1.005, 0.07, d * 1.005);
      const cap = new THREE.Mesh(capGeo, brassMat);
      cap.position.set(x, 0.08 + h / 2, z);
      cap.castShadow = true;
      scene.add(cap);
      trash.push(capGeo);
    }

    // --- dice -------------------------------------------------------------
    const white = buildDie('#f2f0e6', '#1b1b1b');
    const red = buildDie('#b8322a', '#f7efe4');
    white.mesh.position.set(-1.5, FLOOR, 0);
    red.mesh.position.set(1.5, FLOOR, 0);
    scene.add(white.mesh, red.mesh);

    // Start on a believable resting face rather than perfectly axis-aligned.
    white.mesh.quaternion.copy(faceUpQuaternion(5, 0.4));
    red.mesh.quaternion.copy(faceUpQuaternion(2, -0.7));

    // --- animation state ---------------------------------------------------
    type DieState = {
      mesh: THREE.Mesh;
      /** Where it comes to rest. */
      homeX: number;
      homeZ: number;
      /** Where it is thrown in from. */
      entryX: number;
      entryZ: number;
      hop: number;
      lag: number;
      target: THREE.Quaternion;
      captured: THREE.Quaternion | null;
      axis: THREE.Vector3;
      speed: number;
      lastArc: number;
    };

    const states: DieState[] = [
      {
        mesh: white.mesh,
        homeX: -1.6,
        homeZ: 0.35,
        entryX: -4.1,
        entryZ: -2.7,
        hop: 2.1,
        lag: 0,
        target: new THREE.Quaternion(),
        captured: null,
        axis: new THREE.Vector3(1, 0.4, 0.6).normalize(),
        speed: 15,
        lastArc: -1,
      },
      {
        mesh: red.mesh,
        homeX: 1.6,
        homeZ: -0.25,
        entryX: 4.1,
        entryZ: -3.0,
        hop: 2.5,
        lag: 0.09,
        target: new THREE.Quaternion(),
        captured: null,
        axis: new THREE.Vector3(0.5, 0.7, -1).normalize(),
        speed: 18,
        lastArc: -1,
      },
    ];

    let rolling = false;
    let rollStart = 0;
    let resolveRoll: (() => void) | null = null;

    api.current = {
      roll: (a: number, b: number) =>
        new Promise<void>((resolve) => {
          duration = animMs(ROLL_MS);
          const values = [a, b];
          states.forEach((s, i) => {
            s.captured = null;
            s.lastArc = -1;
            // A different yaw each throw so repeats don't look identical.
            s.target.copy(faceUpQuaternion(values[i], (i * 1.3 + values[i] * 0.9) % (Math.PI * 2)));
            s.axis
              .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
              .normalize();
            s.speed = 14 + Math.random() * 7;
          });
          rollStart = performance.now();
          rolling = true;
          resolveRoll = resolve;
        }),
    };

    // Nothing on this table moves unless the dice are in the air, so it only
    // draws when they are — or once more after a resize.
    let dirty = true;
    const frame = (now: number) => {

      if (rolling) {
        const base = clamp01((now - rollStart) / duration);
        let allDone = true;

        for (const s of states) {
          const u = clamp01((base - s.lag) / (1 - s.lag));
          if (u < 1) allDone = false;

          if (u < TUMBLE) {
            // Free tumble: spin fast about a random axis, decelerating.
            const decay = 1 - u / TUMBLE;
            const step = new THREE.Quaternion().setFromAxisAngle(
              s.axis,
              s.speed * 0.016 * (0.3 + decay),
            );
            s.mesh.quaternion.multiply(step);
          } else {
            // Settle: ease from wherever the tumble left off onto the face.
            if (!s.captured) s.captured = s.mesh.quaternion.clone();
            const k = easeOutCubic((u - TUMBLE) / (1 - TUMBLE));
            s.mesh.quaternion.slerpQuaternions(s.captured, s.target, k);
          }

          // Skid across the felt from the throw-in point, slowing under
          // friction, while bouncing in decaying arcs.
          const glide = easeFriction(u);
          s.mesh.position.x = THREE.MathUtils.lerp(s.entryX, s.homeX, glide);
          s.mesh.position.z = THREE.MathUtils.lerp(s.entryZ, s.homeZ, glide);

          const { h, arc } = bounceEnvelope(u);
          s.mesh.position.y = FLOOR + h * s.hop;

          // Each new arc means the die just hit the felt — fire one knock,
          // quieter each time, so the audio tracks the visible bounces.
          if (arc !== s.lastArc) {
            if (arc > 0 && arc < 6) cb.current.onBounce?.(Math.pow(0.5, arc - 1));
            s.lastArc = arc;
          }
        }

        if (allDone) {
          rolling = false;
          for (const s of states) {
            s.mesh.quaternion.copy(s.target);
            s.mesh.position.set(s.homeX, FLOOR, s.homeZ);
            s.lastArc = -1;
          }
          cb.current.onSettle?.();
          resolveRoll?.();
          resolveRoll = null;
        }
      }

      if (rolling || dirty) {
        dirty = false;
        renderer.render(scene, camera);
      }
    };
    const loop = renderLoop(mount, frame, () => rolling, () => {
      dirty = true;
    });

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
      loop.wake();

      frameCamera(
        camera,
        {
          min: new THREE.Vector3(-HALF_X, -0.45, -HALF_Z),
          max: new THREE.Vector3(HALF_X, TRAY_RELIEF, HALF_Z),
        },
        { tilt: CAM_TILT, width: w, height: h, margin: 1.04 },
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      loop.stop();
      ro.disconnect();
      white.dispose();
      red.dispose();
      trash.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      api.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({ roll: (a, b) => api.current?.roll(a, b) ?? Promise.resolve() }),
    [],
  );

  return <div ref={mountRef} className={className} aria-hidden="true" />;
});
