/**
 * A prize wheel that picks your ammunition.
 *
 * Six rounds round the rim. Give it a spin, it slows down, and the fixed pawl
 * at the top ends up over one of them. Replaces the dart board that used to do
 * this job: a dart lands wherever it lands and the camera has to chase it,
 * which is exactly what kept knocking the shot off centre. A wheel spins in
 * place, so the frame never moves and the whole thing stays in view.
 *
 * FRAMING IS ARITHMETIC, NOT A FIT. The camera is ORTHOGRAPHIC and its frustum
 * is set straight from the canvas: the smaller dimension is exactly FIT world
 * units from the hub, the larger one is that times the aspect. A disc of
 * radius <= FIT centred on the origin therefore cannot be off centre and
 * cannot be cropped — there is no converging search to get it wrong and no
 * perspective to bias it. The perspective fit this used before could and did
 * put the wheel through the bottom of its panel.
 *
 * There are no pictures on the wedges. At six to a wheel there is no room for
 * a picture AND a name that can be read, and the name is the part that
 * matters; the round's own artwork is on the card beside the wheel instead.
 *
 * COLOUR. Every wedge is painted with the rarity colour for that round's grade
 * and nothing else — no alternating tint to separate neighbours, because that
 * made two rounds of the same grade look like two different grades. A thin
 * dark separator does that job instead. Gold here is the same gold as a gold
 * reel and a gold keycard; the values live in one place, data/rarity.ts.
 *
 * The spin is choreographed rather than simulated: the caller decides which
 * wedge wins (seeded, so a shared link spins to the same round) and this
 * animates a spin that ends there.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { Ammo } from '../data/ammo';
import { TIER_NAME, ammoTier, tierHex } from '../data/rarity';
import { frameCamera } from './frame';
import { renderLoop } from './renderLoop';

export interface AmmoWheelHandle {
  /** Spin so `index` of `rounds` lands under the pawl. Resolves when stopped. */
  spinTo: (rounds: Ammo[], index: number) => Promise<void>;
  /** Repaint the face for a new set of rounds and clear any winner. */
  setRounds: (rounds: Ammo[]) => void;
}

interface Props {
  className?: string;
  /** The wheel being set going. */
  onSpin?: () => void;
  /** Each wedge passing the pawl. `speed` decays 1 -> 0 as it slows. */
  onTick?: (speed: number) => void;
  /** It has stopped and the winner is under the pawl. */
  onLand?: () => void;
}

/* ------------------------------------------------------------------ layout */

const WHEEL_R = 3;
/** The face texture, in pixels. Square: the wheel is a disc. */
const TEX = 1024;
/** Where the wedges start and stop, as a fraction of the face radius. */
const RING_IN = 0.24;
const RING_OUT = 0.97;

/** How long the spin lasts, and how many turns it makes before landing. */
const SPIN_S = 4.2;
const TURNS = 4;

/**
 * Tilted back, so the wheel reads as an object with thickness rather than a
 * flat disc — the same treatment the other stages get. Measured from straight
 * down, so 90 degrees would be dead level with the face.
 */
const CAM_TILT = (74 * Math.PI) / 180;

const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
/** Slows the way a weighted wheel does: fast, then a long tail. */
const spinEase = (u: number) => 1 - Math.pow(1 - u, 3.4);

/** A round's colour: its rarity grade, from the one shared palette. */
const wedgeColor = (a: Ammo): string => tierHex(ammoTier(a.pen, a.id));

/**
 * Draw the face: wedges, pictures, labels and a plain hub.
 *
 * The hub carries no text. It used to say what the board was, which read as a
 * logo stuck in the middle of the wheel; the panel beside it already says.
 */
function wheelTexture(rounds: Ammo[], winner: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = TEX;
  c.height = TEX;
  const g = c.getContext('2d')!;
  const mid = TEX / 2;
  const R = mid;

  g.fillStyle = '#0b1219';
  g.beginPath();
  g.arc(mid, mid, R, 0, Math.PI * 2);
  g.fill();

  const n = rounds.length;
  if (n > 0) {
    const step = (Math.PI * 2) / n;
    rounds.forEach((a, i) => {
      // -90deg so wedge 0 starts at the top, under the pawl.
      const start = -Math.PI / 2 + i * step;
      const end = start + step;

      g.beginPath();
      g.arc(mid, mid, R * RING_OUT, start, end);
      g.arc(mid, mid, R * RING_IN, end, start, true);
      g.closePath();
      // Grade colour, flat. Nothing is darkened to separate neighbours — that
      // is what made two Epics look like two different rarities.
      g.fillStyle = wedgeColor(a);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.6)';
      g.lineWidth = 6;
      g.stroke();

      // The winner gets a bright edge once the wheel has stopped.
      if (i === winner) {
        g.save();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 10;
        g.shadowColor = 'rgba(255,255,255,0.8)';
        g.shadowBlur = 22;
        g.stroke();
        g.restore();
      }

      const a0 = start + step / 2;
      const flip = Math.cos(a0) < 0;
      g.save();
      g.translate(mid, mid);
      g.rotate(flip ? a0 + Math.PI : a0);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const rMid = R * (RING_IN + RING_OUT) * 0.5;
      const x = flip ? -rMid : rMid;

      const label = a.name;
      const size = label.length > 18 ? 26 : label.length > 12 ? 32 : label.length > 8 ? 40 : 48;
      g.font = `800 ${size}px system-ui, sans-serif`;
      g.fillStyle = '#f7fbff';
      g.shadowColor = 'rgba(0,0,0,0.75)';
      g.shadowBlur = 10;
      g.fillText(label, x, -16);

      g.font = '700 24px ui-monospace, monospace';
      g.fillStyle = 'rgba(255,255,255,0.86)';
      const grade = TIER_NAME[ammoTier(a.pen, a.id)].toUpperCase();
      g.fillText(a.pen === null ? grade : `${grade} · PEN ${a.pen}`, x, 28);
      g.restore();
    });
  }

  // Rim line.
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(220,235,245,0.5)';
  g.lineWidth = 8;
  g.beginPath();
  g.arc(mid, mid, R * RING_OUT, 0, Math.PI * 2);
  g.stroke();

  // Plain hub — a cap, not a badge.
  g.beginPath();
  g.arc(mid, mid, R * RING_IN, 0, Math.PI * 2);
  g.fillStyle = '#0a141a';
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.14)';
  g.lineWidth = 6;
  g.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* --------------------------------------------------------------- component */

export const AmmoWheel = forwardRef<AmmoWheelHandle, Props>(function AmmoWheel(
  { className, onSpin, onTick, onLand },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<AmmoWheelHandle | null>(null);
  const cb = useRef({ onSpin, onTick, onLand });
  cb.current = { onSpin, onTick, onLand };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduced ? 3 : 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15; // matched to the other scenes
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    // REQUIRED, not cosmetic. setSize(w, h, false) leaves the canvas with no
    // CSS size, so the element lays out at its BUFFER size — which is
    // pixelRatio times the intended size. On any display scaled above 1x that
    // is a canvas twice as wide as its panel, clipped to the top-left corner,
    // which is exactly what "the wheel is not centred" looked like. Every
    // other scene in this app sets these two lines; this one had missed them.
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

    const bin: { dispose(): void }[] = [];
    const keep = <T extends { dispose(): void }>(x: T) => {
      bin.push(x);
      return x;
    };

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(1.6, 3, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x0ff796, 0.4);
    rim.position.set(-4, 1, 3);
    scene.add(rim);

    /* -------------------------------------------------------------- wheel */
    /** Everything that turns. The pawl is deliberately NOT in here. */
    const wheel = new THREE.Group();
    scene.add(wheel);

    // A drum rather than a disc: deep enough that the tilt shows its side.
    const backing = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(WHEEL_R * 1.04, WHEEL_R * 0.99, 0.62, 64)),
      keep(new THREE.MeshStandardMaterial({ color: 0x141c24, roughness: 0.8, metalness: 0.15 })),
    );
    backing.rotation.x = Math.PI / 2;
    backing.position.z = -0.32;
    wheel.add(backing);

    let faceTex = wheelTexture([], -1);
    const faceMat = keep(new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.72 }));
    const face = new THREE.Mesh(keep(new THREE.CircleGeometry(WHEEL_R, 96)), faceMat);
    wheel.add(face);

    const brass = keep(
      new THREE.MeshStandardMaterial({ color: 0xb8974c, metalness: 0.45, roughness: 0.3 }),
    );
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(WHEEL_R * 1.02, 0.11, 14, 96)), brass);
    ring.position.z = 0.02;
    wheel.add(ring);

    /**
     * Pegs on the rim, one per wedge boundary.
     *
     * The thing that sells a prize wheel as an object rather than a picture of
     * one: they catch the light, and they turn with it so the eye can see it
     * moving even before the labels are readable.
     */
    const pegGeo = keep(new THREE.SphereGeometry(0.1, 12, 10));
    const pegs = new THREE.Group();
    wheel.add(pegs);
    const layPegs = (n: number) => {
      pegs.clear();
      if (n <= 0) return;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
        const peg = new THREE.Mesh(pegGeo, brass);
        peg.position.set(Math.cos(a) * WHEEL_R * 1.02, -Math.sin(a) * WHEEL_R * 1.02, 0.13);
        pegs.add(peg);
      }
    };

    // Hub cap, standing proud of the face.
    const cap = new THREE.Mesh(
      keep(new THREE.SphereGeometry(WHEEL_R * 0.2, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2)),
      keep(new THREE.MeshStandardMaterial({ color: 0x1b2730, metalness: 0.4, roughness: 0.4 })),
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.02;
    wheel.add(cap);

    /* --------------------------------------------------------------- pawl */
    /**
     * The pointer at twelve o'clock. Outside the wheel group, so it stays put
     * while the wheel turns under it — that is the whole mechanic.
     */
    const pawl = new THREE.Group();
    const blade = new THREE.Mesh(
      keep(new THREE.ConeGeometry(0.24, 0.72, 3)),
      keep(new THREE.MeshStandardMaterial({ color: 0xf2f6f8, metalness: 0.3, roughness: 0.35 })),
    );
    // Nose down, into the rim.
    blade.rotation.z = Math.PI;
    blade.position.y = WHEEL_R * 0.99;
    pawl.add(blade);
    const boss = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(0.13, 0.13, 0.18, 16)),
      keep(new THREE.MeshStandardMaterial({ color: 0x0ff796, metalness: 0.2, roughness: 0.5 })),
    );
    boss.rotation.x = Math.PI / 2;
    // Tucked in behind the blade rather than standing off above it. The frame
    // has to be symmetric about the hub for the wheel to sit dead centre, so
    // every unit the pawl adds above the rim is a unit of empty felt added
    // below it, and the wheel shrinks to fit both.
    boss.position.y = WHEEL_R * 1.14;
    pawl.add(boss);
    pawl.position.z = 0.2;
    scene.add(pawl);

    /* ------------------------------------------------------------ framing */
    let viewW = 1;
    let viewH = 1;

    /**
     * Fixed. Computed on resize only.
     *
     * A square box centred on the hub, wide enough for the rim and tall enough
     * for the pawl above it. Symmetric in depth as well — with the camera
     * tilted, a lopsided depth range moves the centre of the box off the face
     * of the wheel and rides the whole thing up the canvas.
     */
    /**
     * The half-extent the frame must hold: the rim, or the pawl if it reaches
     * higher. Symmetric about the hub in every direction, so the wheel is
     * centred by construction — a lopsided box is what pushed the old dart
     * board off centre, and with a tilted camera it does not take much.
     */
    const FIT = Math.max(WHEEL_R * 1.09 + 0.1, WHEEL_R * 1.14 + 0.14);

    const reframe = () => {
      frameCamera(
        camera,
        {
          min: new THREE.Vector3(-FIT, -FIT, -FIT * 0.2),
          max: new THREE.Vector3(FIT, FIT, FIT * 0.2),
        },
        { tilt: CAM_TILT, width: viewW, height: viewH, margin: 1.05 },
      );
    };

    /* ---------------------------------------------------------- animation */
    let t = -1;
    let from = 0;
    let to = 0;
    let resolveRun: (() => void) | null = null;
    let lastWedge = -1;
    let count = 0;
    let dirty = true;
    let loop: ReturnType<typeof renderLoop> | null = null;

    const paint = (rounds: Ammo[], winner: number) => {
      faceTex.dispose();
      faceTex = wheelTexture(rounds, winner);
      faceMat.map = faceTex;
      faceMat.needsUpdate = true;
      dirty = true;
      loop?.wake();
    };

    let current: Ammo[] = [];

    const setRounds = (rounds: Ammo[]) => {
      current = rounds;
      count = rounds.length;
      layPegs(rounds.length);
      wheel.rotation.z = 0;
      paint(rounds, -1);
    };

    api.current = {
      setRounds,
      spinTo: (rounds, index) =>
        new Promise<void>((resolve) => {
          if (rounds.length === 0 || index < 0) {
            resolve();
            return;
          }
          if (rounds !== current) setRounds(rounds);
          paint(rounds, -1);

          const step = (Math.PI * 2) / rounds.length;
          // Wedge i sits at world angle PI/2 - (i+0.5)*step before the wheel
          // turns, and the pawl is at PI/2. Turning by (i+0.5)*step puts that
          // wedge under it; whole turns on top of that are just show.
          const land = (index + 0.5) * step;
          from = wheel.rotation.z % (Math.PI * 2);
          const delta = ((land - from) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          to = from + delta + TURNS * Math.PI * 2;

          t = 0;
          lastWedge = -1;
          resolveRun = () => {
            paint(rounds, index);
            cb.current.onLand?.();
            resolve();
          };
          cb.current.onSpin?.();
          dirty = true;
        }),
    };

    /* ------------------------------------------------------------- render */
    const running = () => t >= 0 && t < SPIN_S;

    const frame = (_now: number, dt: number) => {
      if (running()) {
        t = Math.min(SPIN_S, t + dt * speed);
        const u = clamp01(t / SPIN_S);
        wheel.rotation.z = from + (to - from) * spinEase(u);

        // One tick per wedge passing the pawl, at the speed it passed.
        if (count > 0) {
          const step = (Math.PI * 2) / count;
          const w = Math.floor(wheel.rotation.z / step);
          if (w !== lastWedge) {
            if (lastWedge !== -1) cb.current.onTick?.(1 - u);
            lastWedge = w;
          }
        }

        dirty = true;
        if (t >= SPIN_S) {
          const done = resolveRun;
          resolveRun = null;
          t = -1;
          done?.();
        }
      }

      if (running() || dirty) {
        dirty = false;
        renderer.render(scene, camera);
      }
    };

    loop = renderLoop(mount, frame, running, () => {
      dirty = true;
    });

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      viewW = w;
      viewH = h;
      dirty = true;
      loop?.wake();
      reframe();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      ro.disconnect();
      loop?.stop();
      faceTex.dispose();
      for (const d of bin) d.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      api.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    (): AmmoWheelHandle => ({
      spinTo: (rounds, index) => api.current?.spinTo(rounds, index) ?? Promise.resolve(),
      setRounds: (rounds) => api.current?.setRounds(rounds),
    }),
    [],
  );

  return <div ref={mountRef} className={className} />;
});
