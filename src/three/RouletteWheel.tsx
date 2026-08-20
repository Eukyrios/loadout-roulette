/**
 * A top-down 3D roulette wheel, rendered with plain three.js.
 *
 * Colour is the whole game here: red pockets are Easy, black are Normal, green
 * are Hard. The wheel is built from `WHEEL_POCKETS`, so changing that array
 * changes both the wheel and the odds.
 *
 * The spin is choreographed, not simulated. The caller decides which pocket
 * wins (seeded, so a roll is reproducible) and this component animates the ball
 * so it lands there. Physics simulation would be prettier and non-deterministic,
 * which is the wrong trade for a tool people share links to.
 *
 *   ANGLE CONVENTION
 *   A point at local angle t sits at (r·cos t, y, -r·sin t). Rotating the wheel
 *   group by phi about Y turns that into (r·cos(t+phi), y, -r·sin(t+phi)), so a
 *   pocket's world angle is just localAngle + phi. All the maths below leans on
 *   that identity.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { POCKET_COLORS, WHEEL_POCKETS } from '../data/deltaforce';
import { frameCamera } from './frame';

export interface RouletteHandle {
  /** Animate the ball into `pocket`. Resolves when it settles. */
  spin: (pocket: number) => Promise<void>;
}

interface Props {
  /** Called once the ball has settled, with the winning pocket index. */
  onResult?: (pocket: number) => void;
  /** Called the moment a spin begins. */
  onSpinStart?: () => void;
  /** Fired on each ball-to-track contact. `strength` decays 1 → 0. */
  onRattle?: (strength: number) => void;
  className?: string;
}

/* ------------------------------------------------------------------ layout */

const POCKET_COUNT = WHEEL_POCKETS.length;
const STEP = (Math.PI * 2) / POCKET_COUNT;

const R_HUB = 1.5;
const R_POCKET_IN = 2.6;
const R_POCKET_OUT = 4.3;
const R_APRON = 5.2;
const R_TRACK = 6.0;
const R_BOWL = 6.9;

const Y_POCKET = 0.22;
const Y_TRACK = 1.05;
const BALL_R = 0.2;

/**
 * The apron is the cone the ball slides down. It is HIGH at the outer edge and
 * LOW where it meets the pockets — get that backwards and you build a volcano
 * that the ball would have to roll uphill into.
 */
const Y_APRON_IN = Y_POCKET + 0.08; // at r = R_POCKET_OUT
const Y_APRON_OUT = Y_POCKET + 0.62; // at r = R_APRON

/** Height of the apron surface at radius r. Used to seat things ON it. */
const apronY = (r: number) =>
  Y_APRON_IN +
  ((r - R_POCKET_OUT) / (R_APRON - R_POCKET_OUT)) * (Y_APRON_OUT - Y_APRON_IN);

const CAM_TILT = (24 * Math.PI) / 180; // from straight down
const CAM_FOV = 38;
/** Outer silhouette of the bowl: rim radius plus a sliver of air. */
const FIT_RADIUS = R_BOWL + 0.25;
/** Top of the rim — the highest thing that must stay in frame. */
const FIT_HEIGHT = Y_TRACK + 0.8;

const SPIN_MS = 6200;
const WHEEL_TURNS = 5;
const BALL_TURNS = 13;
const IDLE_SPEED = 0.09; // rad/s when at rest

/* ------------------------------------------------------------------ easing */

const easeOutCubic = (u: number) => 1 - Math.pow(1 - u, 3);
const easeInCubic = (u: number) => u * u * u;
const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Angular travel under friction. A ball slowing down loses speed roughly in
 * proportion to the speed it still has, so its position follows 1 - e^-kt
 * rather than a polynomial ease. The difference is very visible: polynomial
 * eases coast too long and then stop abruptly.
 */
const FRICTION = 4.2;
const easeFriction = (u: number) =>
  (1 - Math.exp(-FRICTION * u)) / (1 - Math.exp(-FRICTION));

/**
 * A sequence of decaying parabolic hops, normalised over u in [0,1].
 * Each bounce reaches `restitution` of the previous height, and — as with a
 * real ball — its flight time shrinks by sqrt(restitution), so the hops get
 * rapidly shorter and closer together instead of pulsing evenly.
 */
function bounceEnvelope(
  u: number,
  arcs = 5,
  restitution = 0.4,
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

/** Shortest signed difference between two angles. */
const angleDelta = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

/** Height of whatever surface the ball is resting on at radius r. */
function surfaceY(r: number): number {
  if (r >= R_APRON) {
    // Bowl wall, between the apron lip and the ball track.
    const t = clamp01((r - R_APRON) / (R_TRACK - R_APRON));
    return Y_APRON_OUT + t * (Y_TRACK - Y_APRON_OUT);
  }
  if (r >= R_POCKET_OUT) return apronY(r);
  return Y_POCKET;
}

/* ------------------------------------------------------------- scene build */

function buildWheel(): { group: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const trash: (THREE.BufferGeometry | THREE.Material)[] = [];
  const keep = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
    trash.push(x);
    return x;
  };

  // --- pocket floor: one flat annular wedge per pocket -----------------
  WHEEL_POCKETS.forEach((mode, i) => {
    const geo = keep(
      new THREE.RingGeometry(R_POCKET_IN, R_POCKET_OUT, 12, 1, i * STEP, STEP * 0.995),
    );
    const mat = keep(
      new THREE.MeshStandardMaterial({
        color: POCKET_COLORS[mode] ?? 0x333333,
        roughness: 0.55,
        metalness: 0.12,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = Y_POCKET;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // --- frets: metal dividers standing between pockets -------------------
  const fretGeo = keep(new THREE.BoxGeometry(R_POCKET_OUT - R_POCKET_IN, 0.3, 0.075));
  const fretMat = keep(
    new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.28, metalness: 0.95 }),
  );
  for (let i = 0; i < POCKET_COUNT; i++) {
    const fret = new THREE.Mesh(fretGeo, fretMat);
    const a = i * STEP;
    const r = (R_POCKET_IN + R_POCKET_OUT) / 2;
    fret.position.set(r * Math.cos(a), Y_POCKET + 0.15, -r * Math.sin(a));
    fret.rotation.y = a;
    fret.castShadow = true;
    group.add(fret);
  }

  // --- apron: the cone the ball slides down into the pockets ------------
  // radiusTop is the OUTER, higher edge. Reversing these two builds a cone
  // that rises toward the centre, which is what made the deflectors read as
  // floating: they were seated for a surface sloping the other way.
  const apronGeo = keep(
    new THREE.CylinderGeometry(
      R_APRON,
      R_POCKET_OUT,
      Y_APRON_OUT - Y_APRON_IN,
      96,
      1,
      true,
    ),
  );
  const apronMat = keep(
    new THREE.MeshStandardMaterial({
      color: 0x2a1c12,
      roughness: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide,
    }),
  );
  const apron = new THREE.Mesh(apronGeo, apronMat);
  apron.position.y = (Y_APRON_IN + Y_APRON_OUT) / 2;
  apron.receiveShadow = true;
  group.add(apron);

  // --- hub: the turret in the middle ------------------------------------
  // Satin brass, not polished. At roughness 0.22 / metalness 1 the turret acted
  // as a mirror and every lamp in the rig showed up as a hard white hotspot on
  // it; a rougher, slightly darker finish scatters those into a soft sheen.
  const hubMat = keep(
    new THREE.MeshStandardMaterial({ color: 0xb2913a, roughness: 0.58, metalness: 0.82 }),
  );
  const hubGeo = keep(new THREE.CylinderGeometry(R_HUB, R_HUB * 1.35, 0.5, 48));
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.position.y = Y_POCKET + 0.25;
  hub.castShadow = true;
  group.add(hub);

  const domeGeo = keep(new THREE.SphereGeometry(R_HUB * 0.62, 32, 20));
  const dome = new THREE.Mesh(domeGeo, hubMat);
  dome.position.y = Y_POCKET + 0.5;
  dome.scale.y = 0.75;
  dome.castShadow = true;
  group.add(dome);

  const spindleGeo = keep(new THREE.ConeGeometry(0.16, 1.5, 20));
  const spindle = new THREE.Mesh(spindleGeo, hubMat);
  spindle.position.y = Y_POCKET + 1.25;
  spindle.castShadow = true;
  group.add(spindle);

  // Cross bars over the hub, the way a real wheel's turret is spoked.
  const barGeo = keep(new THREE.BoxGeometry(R_HUB * 2.5, 0.1, 0.14));
  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(barGeo, hubMat);
    bar.position.y = Y_POCKET + 0.62;
    bar.rotation.y = (i * Math.PI) / 4;
    bar.castShadow = true;
    group.add(bar);
  }

  // --- deflectors ("canoes") on the apron -------------------------------
  // Cosmetic only — the landing is choreographed, these never touch the ball.
  //
  // A capsule's long axis is its local +Y. Composing Euler angles by hand to
  // point that along a radius gets the twist wrong at most angles, so build
  // the orientation directly: rotate +Y onto the outward radial vector, which
  // by definition aims each deflector at the centre of the wheel.
  const defGeo = keep(new THREE.CapsuleGeometry(0.085, 0.36, 4, 10));
  const defMat = keep(
    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 1 }),
  );
  const UP = new THREE.Vector3(0, 1, 0);
  const DEF_R = 0.085;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + STEP / 2;
    const r = R_APRON - 0.35;
    const def = new THREE.Mesh(defGeo, defMat);

    // Sit ON the apron rather than at a guessed height, so the contact shadow
    // lands under the deflector instead of detaching from it.
    def.position.set(r * Math.cos(a), apronY(r) + DEF_R * 0.72, -r * Math.sin(a));

    const radial = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    def.quaternion.setFromUnitVectors(UP, radial);

    def.castShadow = true;
    def.receiveShadow = true;
    group.add(def);
  }

  return {
    group,
    dispose: () => trash.forEach((t) => t.dispose()),
  };
}

function buildBowl(): { group: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const trash: (THREE.BufferGeometry | THREE.Material)[] = [];

  // Lathe profile: the ball track lip, then the wall dropping to the base.
  const profile = [
    new THREE.Vector2(R_APRON, Y_POCKET + 0.5),
    new THREE.Vector2(R_TRACK - 0.35, Y_TRACK - 0.42),
    new THREE.Vector2(R_TRACK + 0.05, Y_TRACK - 0.16),
    new THREE.Vector2(R_BOWL - 0.3, Y_TRACK + 0.5),
    new THREE.Vector2(R_BOWL, Y_TRACK + 0.62),
    new THREE.Vector2(R_BOWL, -0.55),
    new THREE.Vector2(0, -0.55),
  ];
  const bowlGeo = new THREE.LatheGeometry(profile, 96);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0x3b2718,
    roughness: 0.62,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.receiveShadow = true;
  group.add(bowl);
  trash.push(bowlGeo, bowlMat);

  // Brass rim around the very top edge.
  const rimGeo = new THREE.TorusGeometry(R_BOWL, 0.13, 16, 96);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 1,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = Y_TRACK + 0.62;
  group.add(rim);
  trash.push(rimGeo, rimMat);

  return { group, dispose: () => trash.forEach((t) => t.dispose()) };
}

/* -------------------------------------------------------------- component */

export const RouletteWheel = forwardRef<RouletteHandle, Props>(function RouletteWheel(
  { onResult, onSpinStart, onRattle, className },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  // Imperative animation state, deliberately outside React.
  const api = useRef<{
    spin: (pocket: number) => Promise<void>;
  } | null>(null);
  const cb = useRef({ onResult, onSpinStart, onRattle });
  cb.current = { onResult, onSpinStart, onRattle };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- renderer -------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    /* ---- scene ----------------------------------------------------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 100);
    camera.position.set(0, 15.5, 6.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x8899bb, 1.05));

    const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
    key.position.set(-7, 15, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    // Without these, small props sitting on a curved surface either shadow-acne
    // or peter-pan away from their own contact point.
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.022;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    scene.add(key);

    const warm = new THREE.PointLight(0xffb056, 90, 30, 2);
    warm.position.set(4, 7, -4);
    scene.add(warm);

    const cool = new THREE.PointLight(0x5f8dff, 55, 30, 2);
    cool.position.set(-5, 5, -6);
    scene.add(cool);

    const bowl = buildBowl();
    scene.add(bowl.group);

    const wheel = buildWheel();
    scene.add(wheel.group);

    const ballGeo = new THREE.SphereGeometry(BALL_R, 24, 18);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdf5,
      roughness: 0.16,
      metalness: 0.05,
      emissive: 0x222018,
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.castShadow = true;
    scene.add(ball);

    /* ---- animation state ------------------------------------------- */
    let phi = 0; // wheel rotation
    let ballAngle = 0;
    let ballRadius = R_TRACK - 0.3;
    let ballY = Y_TRACK;

    let spinStart = 0;
    let spinning = false;
    let landed = true;
    let pocketLocal = 0; // local angle of the winning pocket
    let phiAtStart = 0;
    let ballDelta = 0;
    let ballStart = 0;
    let lastArc = -1;
    let resolveSpin: (() => void) | null = null;
    const duration = reduced ? 1400 : SPIN_MS;

    const placeBall = () => {
      ball.position.set(
        ballRadius * Math.cos(ballAngle),
        ballY,
        -ballRadius * Math.sin(ballAngle),
      );
    };

    api.current = {
      spin: (pocket: number) =>
        new Promise<void>((resolve) => {
          pocketLocal = (pocket + 0.5) * STEP;
          phiAtStart = phi;
          ballStart = ballAngle;
          spinStart = performance.now();
          spinning = true;
          landed = false;
          lastArc = -1;
          resolveSpin = resolve;

          // Where the wheel will be when the ball lands.
          const phiFinal = phiAtStart + WHEEL_TURNS * Math.PI * 2;
          // Shortest forward offset to the winning pocket, then wind the ball
          // backwards past it a whole number of turns so it spins the other way.
          const base = pocketLocal + phiFinal - ballStart;
          const wrapped = ((base % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          ballDelta = wrapped - BALL_TURNS * Math.PI * 2;

          cb.current.onSpinStart?.();
        }),
    };

    /* ---- loop ------------------------------------------------------- */
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (spinning) {
        const u = clamp01((now - spinStart) / duration);

        phi = phiAtStart + WHEEL_TURNS * Math.PI * 2 * easeOutCubic(u);

        // --- angular travel -------------------------------------------
        // Friction curve, then blended onto the pocket over the last stretch
        // so the ball eases into matching the wheel instead of snapping to it.
        const raw = ballStart + ballDelta * easeFriction(u);
        const locked = pocketLocal + phi;
        ballAngle = raw + angleDelta(raw, locked) * smoothstep(0.86, 1, u);

        // --- radius: track, then down the wall, then into the pockets ---
        const R_REST = (R_POCKET_IN + R_POCKET_OUT) / 2;
        const R_START = R_TRACK - 0.28;
        let r: number;
        if (u < 0.42) {
          // Still pinned to the track by its own speed.
          r = R_START;
        } else {
          const fall = clamp01((u - 0.42) / 0.5);
          r = THREE.MathUtils.lerp(R_START, R_REST, easeInCubic(fall));
        }

        // Deflector strikes: brief outward kicks that decay as it loses energy.
        if (u > 0.5 && u < 0.86) {
          const hit = Math.sin((u - 0.5) * 46);
          r += hit * 0.075 * (1 - smoothstep(0.5, 0.86, u));
        }
        ballRadius = r;

        // --- height: rest on the surface, plus decaying hops -------------
        const rest = surfaceY(ballRadius) + BALL_R;
        // Rattling starts when it leaves the track and dies as it settles.
        const { h, arc } = bounceEnvelope(clamp01((u - 0.46) / 0.52), 5, 0.4);
        const hopScale = 0.42 * (1 - smoothstep(0.46, 1, u) * 0.55);
        ballY = rest + h * hopScale;

        // One knock per contact, quieter each time.
        if (arc !== lastArc) {
          if (arc > 0 && arc < 5) cb.current.onRattle?.(Math.pow(0.55, arc - 1));
          lastArc = arc;
        }

        if (u >= 1) {
          spinning = false;
          landed = true;
          ballRadius = R_REST;
          ballY = Y_POCKET + BALL_R;
          cb.current.onResult?.(Math.round((pocketLocal - STEP / 2) / STEP) % POCKET_COUNT);
          resolveSpin?.();
          resolveSpin = null;
        }
      } else {
        // Idle drift, with the ball parked in its pocket.
        phi += IDLE_SPEED * dt;
        if (landed) ballAngle = pocketLocal + phi;
      }

      wheel.group.rotation.y = phi;
      placeBall();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    /* ---- sizing ------------------------------------------------------ */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Slight tilt off vertical — enough to read as 3D, shallow enough that
      // the far rim never hides the near pockets.
      frameCamera(
        camera,
        {
          min: new THREE.Vector3(-FIT_RADIUS, -0.6, -FIT_RADIUS),
          max: new THREE.Vector3(FIT_RADIUS, FIT_HEIGHT, FIT_RADIUS),
        },
        { tilt: CAM_TILT, width: w, height: h, margin: 1.03 },
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* ---- teardown ---------------------------------------------------- */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wheel.dispose();
      bowl.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      api.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      spin: (pocket: number) => api.current?.spin(pocket) ?? Promise.resolve(),
    }),
    [],
  );

  return <div ref={mountRef} className={className} aria-hidden="true" />;
});
