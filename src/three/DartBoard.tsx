/**
 * A dart board that picks your ammunition.
 *
 * The board is built from the rolled weapon's own caliber, so every wedge on
 * it is a round that gun can actually chamber — the dart cannot land on
 * something that does not fit. A gun with no published round list gets no
 * board at all rather than a made-up one.
 *
 * The face is a canvas texture rather than a ring of wedge meshes. Wedges as
 * geometry means one mesh, one material and one draw call per round, plus a
 * second pass for the labels; as a texture it is a single disc, the labels are
 * crisp at any zoom, and the whole thing redraws in a millisecond when the
 * weapon changes.
 *
 * Like every other stage the throw is choreographed rather than simulated: the
 * caller decides which wedge wins (seeded, so a shared link throws the same
 * dart) and this animates a flight that ends there.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { Ammo } from '../data/ammo';
import { TIER_NAME, ammoTier, tierHex } from '../data/rarity';
import { frameCamera } from './frame';
import { renderLoop } from './renderLoop';

export interface DartHandle {
  /** Throw at `index` of `rounds`. Resolves when the dart has stopped moving. */
  throwAt: (rounds: Ammo[], index: number) => Promise<void>;
  /** Rebuild the face for a new weapon and pull the dart out. */
  setBoard: (rounds: Ammo[], caliber: string | null) => void;
}

interface Props {
  className?: string;
  /** The dart leaving the hand. */
  onThrow?: () => void;
  /** The point going in. */
  onHit?: () => void;
  /** The flight quivering afterwards. */
  onWobble?: () => void;
}

/* ------------------------------------------------------------------ layout */

const BOARD_R = 3;
/** The face texture, in pixels. Square: the board is a disc. */
const TEX = 1024;
/** Where the wedges start and stop, as a fraction of the face radius. */
const RING_IN = 0.26;
const RING_OUT = 0.97;

/* Seconds. */
const T_FLY = 0.62;
const T_WOBBLE = 0.9;
const T_TOTAL = T_FLY + T_WOBBLE;

/** Looking at the board very slightly from above, like standing at the oche. */
const CAM_TILT = (82 * Math.PI) / 180;

const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const smooth = (u: number) => u * u * (3 - 2 * u);

/**
 * A round's wedge colour: its rarity, not a palette of my own.
 *
 * Ammunition is graded on the same 1-6 ladder as every other item in the game
 * and the reels already paint gear with it, so the board uses the same six
 * colours. A gold wedge here means the same thing a gold reel does.
 */
function wedgeColor(a: Ammo): string {
  return tierHex(ammoTier(a.pen, a.id));
}

/** The round's name with the caliber stripped — every wedge shares it. */
function shortName(a: Ammo): string {
  const s = a.name.slice(a.caliber.length).trim();
  return s || a.name;
}

/**
 * Draw the whole face: wedges, separators, labels and the bull.
 *
 * Returns the texture. The caller owns disposing it.
 */
function boardTexture(rounds: Ammo[], caliber: string | null): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = TEX;
  c.height = TEX;
  const g = c.getContext('2d')!;
  const mid = TEX / 2;
  const R = mid;

  // The cork backing shows through wherever a wedge does not reach.
  g.fillStyle = '#0b1219';
  g.beginPath();
  g.arc(mid, mid, R, 0, Math.PI * 2);
  g.fill();

  const n = rounds.length;
  if (n > 0) {
    const step = (Math.PI * 2) / n;
    rounds.forEach((a, i) => {
      // -90deg so wedge 0 starts at the top, where the eye goes first.
      const start = -Math.PI / 2 + i * step;
      const end = start + step;

      g.beginPath();
      g.arc(mid, mid, R * RING_OUT, start, end);
      g.arc(mid, mid, R * RING_IN, end, start, true);
      g.closePath();
      g.fillStyle = wedgeColor(a);
      g.fill();
      // Alternate wedges are knocked back, so neighbouring rounds on the same
      // penetration level do not merge into one block of colour.
      if (i % 2 === 1) {
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.fill();
      }
      g.strokeStyle = 'rgba(0,0,0,0.55)';
      g.lineWidth = 5;
      g.stroke();

      // Label, laid along the wedge's centre line reading outward. Flipped on
      // the left half so nothing ends up upside down.
      const a0 = start + step / 2;
      const flip = Math.cos(a0) < 0;
      g.save();
      g.translate(mid, mid);
      g.rotate(flip ? a0 + Math.PI : a0);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const rMid = R * (RING_IN + RING_OUT) * 0.5;
      const x = flip ? -rMid : rMid;

      const label = shortName(a);
      const size = label.length > 12 ? 34 : label.length > 8 ? 42 : 50;
      g.font = `800 ${size}px system-ui, sans-serif`;
      g.fillStyle = '#f7fbff';
      g.shadowColor = 'rgba(0,0,0,0.75)';
      g.shadowBlur = 10;
      g.fillText(label, x, -18);

      g.font = '700 24px ui-monospace, monospace';
      g.fillStyle = 'rgba(255,255,255,0.86)';
      const grade = TIER_NAME[ammoTier(a.pen, a.id)].toUpperCase();
      g.fillText(a.pen === null ? grade : `${grade} · PEN ${a.pen}`, x, 26);
      g.restore();
    });
  }

  // Wire rim.
  g.strokeStyle = 'rgba(220,235,245,0.5)';
  g.lineWidth = 8;
  g.beginPath();
  g.arc(mid, mid, R * RING_OUT, 0, Math.PI * 2);
  g.stroke();

  // The bull carries the caliber, so the board always says what it is.
  g.beginPath();
  g.arc(mid, mid, R * RING_IN, 0, Math.PI * 2);
  g.fillStyle = '#08111a';
  g.fill();
  g.strokeStyle = 'rgba(15,247,150,0.55)';
  g.lineWidth = 6;
  g.stroke();

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowBlur = 0;
  if (caliber) {
    const size = caliber.length > 10 ? 34 : 42;
    g.font = `800 ${size}px ui-monospace, monospace`;
    g.fillStyle = '#0ff796';
    g.fillText(caliber, mid, mid - 14);
    g.font = '600 22px ui-monospace, monospace';
    g.fillStyle = '#5e7381';
    g.fillText('CALIBER', mid, mid + 24);
  } else {
    g.font = '800 34px ui-monospace, monospace';
    g.fillStyle = '#5e7381';
    g.fillText('NO ROUND', mid, mid);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * One dart: point, barrel, shaft and a pair of flights.
 *
 * Sized generously. The camera looks at the board very nearly head-on, so a
 * realistically slim dart projects to a few pixels and reads as a smudge.
 */
function buildDart(keep: <T extends { dispose(): void }>(x: T) => T): THREE.Group {
  const dart = new THREE.Group();

  /**
   * Built as a lathe rather than a stack of cylinders.
   *
   * A real dart is one continuous turned profile — needle point, swelling
   * barrel, waisted shaft, a collar at the flights — and cylinders butted
   * end to end cannot make those transitions. LatheGeometry takes the profile
   * as a list of (radius, distance-from-the-point) pairs and spins it, which
   * is both closer to how the thing is actually made and cheaper: three
   * meshes instead of a dozen.
   *
   * Materials are deliberately low-metalness. There is no environment map in
   * this scene, and a metal material with nothing to reflect renders as a
   * black silhouette — which is what the first dart looked like.
   */
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe7ee, metalness: 0.3, roughness: 0.34 });
  const tungsten = new THREE.MeshStandardMaterial({
    color: 0x9aa6b1,
    metalness: 0.35,
    roughness: 0.55,
  });
  const alloy = new THREE.MeshStandardMaterial({ color: 0xc48b3a, metalness: 0.32, roughness: 0.38 });
  const flightMat = new THREE.MeshStandardMaterial({
    color: 0x0ff796,
    roughness: 0.55,
    metalness: 0.08,
    side: THREE.DoubleSide,
    emissive: 0x0f9c62,
    emissiveIntensity: 0.55,
  });
  keep(steel);
  keep(tungsten);
  keep(alloy);
  keep(flightMat);

  /** Total length, point to tail, in world units. Board radius is 3. */
  const L = 2.05;

  const lathe = (pts: [number, number][], mat: THREE.Material, seg = 20) => {
    const geo = keep(
      new THREE.LatheGeometry(
        pts.map(([r, y]) => new THREE.Vector2(Math.max(0.0008, r), y)),
        seg,
      ),
    );
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  };

  // The dart is assembled point-at-the-origin, running up +Y, then the whole
  // assembly is turned so the point faces -Z. lookAt aims -Z at its target,
  // so from then on aiming the dart is just aiming at where it is going.
  const axis = new THREE.Group();
  /*
   * +Y becomes -Z, which puts the point at the group's origin and runs the
   * body back along -Z.
   *
   * Worth being precise about, because getting it backwards buries the dart:
   * Object3D.lookAt on a NON-camera aims the object's +Z at the target (three
   * swaps the arguments for anything that is not a camera or a light — the
   * opposite of what the same call does for a camera). So the point has to be
   * the +Z-most part of the dart for lookAt to send it where it is going. The
   * first pass had this the wrong way round and the whole dart ended up
   * behind the board, with 0.15 of a unit poking out the front.
   */
  axis.rotation.x = -Math.PI / 2;
  dart.add(axis);

  // Needle point: a long, slightly concave taper, not a cone.
  axis.add(
    lathe(
      [
        [0.0, 0.0],
        [0.018, 0.06],
        [0.03, 0.16],
        [0.042, 0.3],
        [0.052, 0.4],
        [0.055, 0.44],
      ],
      steel,
    ),
  );

  // Barrel: swells forward of centre and waists in at the back, the way a
  // front-weighted tungsten barrel does.
  const barrel = lathe(
    [
      [0.055, 0.44],
      [0.13, 0.5],
      [0.163, 0.62],
      [0.17, 0.82],
      [0.163, 1.0],
      [0.132, 1.16],
      [0.085, 1.26],
      [0.062, 1.3],
    ],
    tungsten,
    24,
  );
  axis.add(barrel);

  // Knurling: six shallow rings round the grip. Cheaper than a bumped normal
  // map and, at this size, reads better.
  const ringGeo = keep(new THREE.TorusGeometry(0.168, 0.011, 6, 22));
  for (let i = 0; i < 6; i++) {
    const r = new THREE.Mesh(ringGeo, alloy);
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.66 + i * 0.062;
    axis.add(r);
  }

  // Shaft, collar and tail.
  axis.add(
    lathe(
      [
        [0.062, 1.3],
        [0.05, 1.34],
        [0.046, 1.62],
        [0.052, 1.7],
        [0.082, 1.74],
        [0.07, 1.79],
        [0.05, 1.84],
        [0.046, 1.98],
        [0.03, L],
      ],
      steel,
      16,
    ),
  );

  /**
   * Four kite flights round the tail.
   *
   * A real flight is widest at the very back and rakes forward to a point
   * where it meets the shaft, which is what gives a dart its silhouette. Two
   * crossed rectangles do not — that is what the first pass had.
   */
  const fin = new THREE.Shape();
  fin.moveTo(0.03, 1.5);
  fin.lineTo(0.16, 1.63);
  fin.lineTo(0.33, 1.79);
  fin.lineTo(0.33, L + 0.02);
  fin.lineTo(0.03, L - 0.02);
  fin.closePath();
  const finGeo = keep(new THREE.ShapeGeometry(fin));
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(finGeo, flightMat);
    f.rotation.y = (i * Math.PI) / 2;
    f.castShadow = true;
    axis.add(f);
  }

  // Sunk a little along its own axis, so the point is in the cork rather than
  // balanced on the surface of it.
  axis.position.z = 0.09;
  return dart;
}

/* --------------------------------------------------------------- component */

export const DartBoard = forwardRef<DartHandle, Props>(function DartBoard(
  { className, onThrow, onHit, onWobble },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<DartHandle | null>(null);
  const cb = useRef({ onThrow, onHit, onWobble });
  cb.current = { onThrow, onHit, onWobble };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduced ? 2.6 : 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15; // matched to the other scenes
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    const disposables: { dispose(): void }[] = [];
    const keep = <T extends { dispose(): void }>(x: T) => {
      disposables.push(x);
      return x;
    };

    /* ----------------------------------------------------------- lighting */
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2.5, 4, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x0ff796, 0.5);
    rim.position.set(-4, 1, 2);
    scene.add(rim);
    // Straight down the camera's line, so whatever is sticking out of the
    // board is lit rather than silhouetted against its own wedge.
    const front = new THREE.DirectionalLight(0xffffff, 0.85);
    front.position.set(0.5, 1.5, 9);
    scene.add(front);

    /* -------------------------------------------------------------- board */
    /** The board hangs on a wall: face in the XY plane, looking down +Z. */
    const board = new THREE.Group();
    scene.add(board);

    // Backing disc, a touch wider than the face, so the board has an edge.
    const backing = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(BOARD_R * 1.04, BOARD_R * 1.04, 0.34, 64)),
      keep(new THREE.MeshStandardMaterial({ color: 0x141c24, roughness: 0.85, metalness: 0.1 })),
    );
    backing.rotation.x = Math.PI / 2;
    backing.position.z = -0.18;
    backing.receiveShadow = true;
    board.add(backing);

    let faceTex = boardTexture([], null);
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.72 });
    keep(faceMat);
    const face = new THREE.Mesh(keep(new THREE.CircleGeometry(BOARD_R, 96)), faceMat);
    face.receiveShadow = true;
    board.add(face);

    // A brass ring around the rim, the way a real board is bound.
    const ring = new THREE.Mesh(
      keep(new THREE.TorusGeometry(BOARD_R * 1.02, 0.07, 12, 96)),
      keep(new THREE.MeshStandardMaterial({ color: 0x9a8342, metalness: 0.9, roughness: 0.3 })),
    );
    board.add(ring);

    /* --------------------------------------------------------------- dart */
    const dart = buildDart(keep);
    dart.visible = false;
    dart.castShadow = true;
    dart.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    scene.add(dart);

    /* ------------------------------------------------------------- sparks */
    /** Cork dust off the impact. Cheap points, same trick as the capsule. */
    const SPARKS = 70;
    const sparkPos = new Float32Array(SPARKS * 3);
    const sparkVel = Array.from({ length: SPARKS }, () => new THREE.Vector3());
    const sparkGeo = keep(new THREE.BufferGeometry());
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = keep(
      new THREE.PointsMaterial({
        color: 0xffd9a0,
        size: 0.07,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);
    let sparkLife = 0;

    const burstAt = (p: THREE.Vector3) => {
      for (let i = 0; i < SPARKS; i++) {
        sparkPos[i * 3] = p.x;
        sparkPos[i * 3 + 1] = p.y;
        sparkPos[i * 3 + 2] = p.z;
        const a = Math.random() * Math.PI * 2;
        const r = 0.6 + Math.random() * 2.6;
        sparkVel[i].set(Math.cos(a) * r, Math.sin(a) * r + 1.2, 0.8 + Math.random() * 1.8);
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkLife = 1;
    };

    /* ------------------------------------------------------------ framing */
    let viewW = 1;
    let viewH = 1;
    let camDirty = true;
    /** 0 = whole board, 1 = closed in on where the dart went. */
    let focus = 0;
    const hit = new THREE.Vector3();

    const reframe = () => {
      /**
       * A board is a disc, so the box it is framed in has to be square and
       * centred on the disc — anything else lands it off-centre in the panel.
       *
       * The depth range matters more than it looks. It used to run -0.5 to
       * 1.2, and the camera is tilted, so an asymmetric depth pushes the box's
       * centre off the board's plane and the whole thing rides up the canvas.
       * Keeping it symmetric about z = 0 puts the projected centre of the disc
       * on the centre of the frame.
       */
      const pad = BOARD_R * 1.1;
      const wide = {
        min: new THREE.Vector3(-pad, -pad, -pad * 0.22),
        max: new THREE.Vector3(pad, pad, pad * 0.22),
      };
      // Closing in leans toward the dart without letting go of the board: the
      // box keeps the bull inside it, so the shot never becomes a crop of one
      // wedge with no context.
      const zoom = 0.88;
      const cx = hit.x * (1 - zoom);
      const cy = hit.y * (1 - zoom);
      const zr = pad * zoom;
      const close = {
        min: new THREE.Vector3(cx - zr, cy - zr, -pad * 0.22),
        max: new THREE.Vector3(cx + zr, cy + zr, pad * 0.22),
      };
      const e = smooth(focus);
      frameCamera(
        camera,
        { min: wide.min.clone().lerp(close.min, e), max: wide.max.clone().lerp(close.max, e) },
        { tilt: CAM_TILT, width: viewW, height: viewH, margin: 1.06 },
      );
    };

    /* ---------------------------------------------------------- animation */
    let t = -1;
    let resolveRun: (() => void) | null = null;
    let hitFired = false;
    /** Where the dart starts: low, near, and off to one side. */
    const from = new THREE.Vector3(-1.1, -3.4, 8.5);
    const wobbleAxis = new THREE.Vector3(1, 0, 0);
    /**
     * How the dart sits once it is in.
     *
     * NOT the direction it flew in on. A dart that arrives head-on ends up
     * pointing at the camera, where it projects to a dot and you cannot tell
     * it landed at all. A real one droops anyway, so this pitches the tail up
     * and out where the whole length of it is visible against the face.
     */
    const stuck = new THREE.Vector3(0.22, -1.05, -0.8).normalize();
    const stuckAim = new THREE.Vector3();
    const flyQuat = new THREE.Quaternion();
    const stuckQuat = new THREE.Quaternion();
    let dirty = true;

    const setBoard = (rounds: Ammo[], caliber: string | null) => {
      faceTex.dispose();
      faceTex = boardTexture(rounds, caliber);
      faceMat.map = faceTex;
      faceMat.needsUpdate = true;
      dart.visible = false;
      t = -1;
      focus = 0;
      sparkLife = 0;
      sparkMat.opacity = 0;
      camDirty = true;
      dirty = true;
    };

    api.current = {
      setBoard,
      throwAt: (rounds, index) =>
        new Promise<void>((resolve) => {
          const n = rounds.length;
          if (n === 0 || index < 0) {
            resolve();
            return;
          }
          // The middle of the winning wedge, nudged off dead centre so two
          // throws at the same round do not land in the same hole.
          const step = (Math.PI * 2) / n;
          const a0 = -Math.PI / 2 + (index + 0.5) * step;
          // Hashed off the index rather than random: the throw is seeded, and
          // a shared link should put the dart in the same spot.
          const jig = (((index * 2654435761) >>> 0) % 1000) / 1000;
          const ang = a0 + (jig - 0.5) * step * 0.5;
          const rad = BOARD_R * (RING_IN + (RING_OUT - RING_IN) * (0.32 + jig * 0.42));
          // Canvas y runs down the texture, the world's runs up.
          hit.set(Math.cos(ang) * rad, -Math.sin(ang) * rad, 0.04);

          // A different approach each time, so it does not look like a rail.
          from.set(-1.6 + jig * 3.2, -3.6 + jig * 0.8, 8.5);
          wobbleAxis.set(Math.cos(jig * 6.28), Math.sin(jig * 6.28), 0).normalize();

          dart.position.copy(from);
          dart.visible = true;
          t = 0;
          hitFired = false;
          resolveRun = resolve;
          cb.current.onThrow?.();
          dirty = true;
        }),
    };

    /* ------------------------------------------------------------- render */
    const running = () => (t >= 0 && t < T_TOTAL) || sparkLife > 0;
    const settling = () => focus !== (t >= T_FLY ? 1 : 0);
    const aim = new THREE.Vector3();

    const frame = (_now: number, dt: number) => {
      const step = dt * speed;

      if (t >= 0 && t < T_TOTAL) {
        t = Math.min(T_TOTAL, t + step);

        if (t < T_FLY) {
          // --- in flight ------------------------------------------------
          const u = clamp01(t / T_FLY);
          const e = easeOut(u);
          dart.position.lerpVectors(from, hit, e);
          // A shallow lob on the way in. Zero at both ends, so it neither
          // starts nor arrives off the line.
          dart.position.y += Math.sin(Math.PI * u) * 0.85;
          // Nose along the path: aim at a point slightly further down it.
          aim.lerpVectors(from, hit, Math.min(1, e + 0.08));
          aim.y += Math.sin(Math.PI * Math.min(1, u + 0.08)) * 0.85;
          dart.lookAt(aim);
          // Spinning about its own axis, the way a thrown dart does. Bled out
          // over the last stretch so it is steady when it lands.
          dart.rotateZ(u * Math.PI * 3 * (1 - smooth(clamp01((u - 0.6) / 0.4))));
          flyQuat.copy(dart.quaternion);
          // Turn into the resting pose over the last fifth of the flight, so
          // it settles into the board rather than snapping round on impact.
          stuckAim.copy(dart.position).add(stuck);
          dart.lookAt(stuckAim);
          stuckQuat.copy(dart.quaternion);
          dart.quaternion.slerpQuaternions(flyQuat, stuckQuat, smooth(clamp01((u - 0.8) / 0.2)));
        } else {
          // --- stuck in the board, still quivering -----------------------
          if (!hitFired) {
            hitFired = true;
            dart.position.copy(hit);
            burstAt(hit);
            cb.current.onHit?.();
            focus = 1;
            camDirty = true;
            window.setTimeout(() => cb.current.onWobble?.(), 90);
          }
          const u = clamp01((t - T_FLY) / T_WOBBLE);
          // Damped oscillation about the axis it came in on.
          const amp = (1 - u) * (1 - u) * 0.17;
          stuckAim.copy(dart.position).add(stuck);
          dart.lookAt(stuckAim);
          dart.rotateOnAxis(wobbleAxis, Math.sin(u * 34) * amp);
        }

        if (t >= T_TOTAL) {
          resolveRun?.();
          resolveRun = null;
        }
        dirty = true;
      }

      if (sparkLife > 0) {
        sparkLife = Math.max(0, sparkLife - step / 0.7);
        for (let i = 0; i < SPARKS; i++) {
          sparkVel[i].y -= 6 * step;
          sparkPos[i * 3] += sparkVel[i].x * step;
          sparkPos[i * 3 + 1] += sparkVel[i].y * step;
          sparkPos[i * 3 + 2] += sparkVel[i].z * step;
        }
        sparkGeo.attributes.position.needsUpdate = true;
        sparkMat.opacity = sparkLife;
        dirty = true;
      } else if (sparkMat.opacity !== 0) {
        sparkMat.opacity = 0;
      }

      // The camera eases toward the closed-in shot rather than cutting.
      if (settling()) {
        const want = t >= T_FLY && t >= 0 ? 1 : 0;
        focus += Math.sign(want - focus) * Math.min(Math.abs(want - focus), step / 0.55);
        camDirty = true;
      }
      if (camDirty || running()) {
        camDirty = running() || settling();
        reframe();
      }

      if (running() || dirty) {
        dirty = false;
        renderer.render(scene, camera);
      }
    };

    const loop = renderLoop(mount, frame, running, () => {
      dirty = true;
      camDirty = true;
    });

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      viewW = w;
      viewH = h;
      camDirty = true;
      dirty = true;
      loop.wake();
      reframe();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      ro.disconnect();
      loop.stop();
      faceTex.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      api.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    (): DartHandle => ({
      throwAt: (rounds, index) => api.current?.throwAt(rounds, index) ?? Promise.resolve(),
      setBoard: (rounds, caliber) => api.current?.setBoard(rounds, caliber),
    }),
    [],
  );

  return <div ref={mountRef} className={className} />;
});
