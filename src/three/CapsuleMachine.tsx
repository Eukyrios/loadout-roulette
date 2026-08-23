/**
 * A gashapon machine that dispenses attachments.
 *
 * The globe shakes, a capsule drops through the chute, bounces into the tray,
 * rises to the middle of the frame and unclips at its seam in a burst of
 * sparks. Its contents then fly out and settle in a row facing you.
 *
 * ITEM PICTURES are real <img> elements tracked onto the cards, not part of
 * the texture. A cross-origin image can only become a WebGL texture if the
 * host sends CORS headers, which theirs does not promise — so the picture
 * would silently never appear. An <img> has no such requirement. Each one is
 * positioned every frame from its card's projected position, and faded in as
 * the card squares up, by which point the card is flat to the camera and a
 * flat overlay sits on it exactly.
 *
 * The capsule ignores what gun you rolled. No source publishes which
 * attachments fit which weapon — the wiki does not carry it and the build
 * pages render their loadouts client-side — so rather than invent a
 * compatibility table the machine is honestly random. It will hand you an
 * M249 handguard for your MP5, and that is the joke.
 *
 * Like every other stage the sequence is choreographed rather than simulated:
 * the caller decides what is in the capsule (seeded, so a shared link opens the
 * same one) and this animates it.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { Attachment } from '../data/attachments';
import { attachImageSrc } from '../data/attachments';
import { frameCamera } from './frame';
import { renderLoop } from './renderLoop';

export interface CapsuleHandle {
  /** Drop a capsule, open it, and lay out `items`. Resolves when settled. */
  dispense: (items: Attachment[]) => Promise<void>;
  /** Clear the table and put the machine back to idle. */
  reset: () => void;
}

interface Props {
  className?: string;
  /** The crank turning and the capsule rattling down the chute. */
  onCrank?: () => void;
  /** Each bounce as it lands in the tray. */
  onBounce?: (strength: number) => void;
  /** The seam popping open — the beat the contents should appear on. */
  onOpen?: () => void;
}

/* ------------------------------------------------------------------ layout */

const BALL_R = 0.62;
const GLOBE_R = 2.15;
const GLOBE_Y = 3.4;
/** Where the chute spits the capsule out, and where the tray floor sits. */
const CHUTE_Y = 1.15;
const TRAY_Y = 0.42;
const TRAY_Z = 1.55;
/** Where the capsule floats to, and how much bigger it gets on the way. */
const OPEN_Y = 2.6;
const OPEN_Z = 2.9;
const OPEN_SCALE = 1.55;

/** Shell colours a dispensed capsule can come out in. */
const SHELL_COLORS = [0xe04a3a, 0x0ff796, 0x4aa8e0, 0xe0a23a, 0xa86ae0, 0xff7ab0, 0x7ae0d0];

/* Seconds, cumulative. */
const T_SHAKE = 1.1;
const T_DROP = 1.15;
const T_SETTLE = 0.5;
const T_RISE = 1.0;
const T_OPEN = 0.55;
const T_FLY = 0.9;
const T_TOTAL = T_SHAKE + T_DROP + T_SETTLE + T_RISE + T_OPEN + T_FLY;

const CAM_TILT = (46 * Math.PI) / 180;
/** The revealed row, in the strip under the machine. */
const CARD_W = 1.7;
const CARD_H = 3.4;
/* Just wider than a card. They must not overlap: they fan toward the camera,
   so an overlapping neighbour covers the outer cards' names. */
const CARD_GAP = 1.78;
/** Mid-frame, roughly where the capsule split — the row rises INTO the shot
 *  rather than dropping out of it. */
const CARD_Y = 4.55;
const CARD_Z = 3.7;

/**
 * The floor of the close-up frame: the machine's base, and no lower.
 *
 * Measured, not guessed. The row is five cards wide, so this shot is
 * WIDTH-bound — the camera distance comes from the row, and the box's height
 * only decides where the content sits vertically. Padding the box downward
 * therefore does not close in on anything; it just slides the machine up the
 * canvas and opens a band of nothing beneath it. Whatever else changes here,
 * this stays pinned to the base.
 */
const CLOSE_FLOOR = -0.2;

/**
 * How far the close-up frame is padded below that floor.
 *
 * Width-bound means the content is letterboxed vertically, and padding the box
 * downward moves its centre down, which slides the row up the canvas. It is
 * kept small on purpose: every unit of it also opens empty space under the
 * machine, and a hole under the machine is worse than a row an inch lower.
 */
const CLOSE_PAD = 0.9;

/** Hard ceiling on the row: five is what a capsule holds and what fits. */
const MAX_CARDS = 5;

const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const smooth = (u: number) => u * u * (3 - 2 * u);

/**
 * Decaying parabolic hops, normalised over u in [0,1] — the same shape the
 * roulette ball uses. Each bounce reaches `rest` of the previous height and
 * its flight time shrinks by sqrt(rest), so they crowd together at the end
 * instead of pulsing evenly.
 */
function hops(u: number, count = 4, rest = 0.36): { h: number; arc: number } {
  if (u <= 0) return { h: 1, arc: -1 };
  if (u >= 1) return { h: 0, arc: count };
  const k = Math.sqrt(rest);
  const spans: number[] = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const d = Math.pow(k, i);
    spans.push(d);
    total += d;
  }
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const d = spans[i] / total;
    if (u < acc + d) {
      const t = (u - acc) / d;
      return { h: Math.pow(rest, i) * 4 * t * (1 - t), arc: i };
    }
    acc += d;
  }
  return { h: 0, arc: count };
}

/* ------------------------------------------------------------------- cards */

/**
 * One attachment as a card: its picture over the name, slot and price.
 *
 * The same cream-and-green treatment as the keycards — one design for every
 * slot. Colour-coding by slot turned the row into a paint chart.
 */
/**
 * The card face, in texture pixels.
 *
 * Kept in the card's own aspect so nothing is stretched: the plane is
 * CARD_W x CARD_H, and the canvas drawn onto it matches. Every position below
 * is in these units, and the <img> overlay converts out of them.
 */
const TEX_W = 300;
const TEX_H = Math.round((TEX_W * CARD_H) / CARD_W);
/** Where the picture sits on that face. */
const ART = { x: 24, y: 80, w: 252, h: 252 };

/**
 * A rough silhouette of the slot, drawn on the art plate.
 *
 * This is what you see when the picture cannot be loaded — the mirror has not
 * been made and the CDN refused the hotlink. It is deliberately crude: enough
 * to tell a muzzle from a magazine at a glance, not a substitute for the art.
 * Drawn in a unit box from -0.5..0.5 and scaled, so one set of coordinates
 * works at any card size.
 */
function slotGlyph(g: CanvasRenderingContext2D, cat: string, cx: number, cy: number, s: number) {
  const box = (x: number, y: number, w: number, h: number) =>
    g.fillRect(cx + x * s, cy + y * s, w * s, h * s);
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.20)';
  switch (cat) {
    case 'muzzle': // a can on the end of a thread
      box(-0.5, -0.16, 0.62, 0.32);
      box(0.12, -0.08, 0.3, 0.16);
      break;
    case 'barrel': // a long tube stepping down
      box(-0.5, -0.1, 0.7, 0.2);
      box(0.2, -0.15, 0.3, 0.3);
      break;
    case 'handguard': // a slotted rail
      box(-0.5, -0.14, 1, 0.28);
      g.fillStyle = 'rgba(0,0,0,0.45)';
      for (let i = 0; i < 5; i++) box(-0.42 + i * 0.19, -0.06, 0.1, 0.12);
      break;
    case 'foregrip': // a stub hanging off a rail
      box(-0.42, -0.28, 0.84, 0.14);
      box(-0.1, -0.14, 0.2, 0.46);
      break;
    case 'rear grip': // a canted pistol grip
      g.beginPath();
      g.moveTo(cx - 0.18 * s, cy - 0.4 * s);
      g.lineTo(cx + 0.2 * s, cy - 0.4 * s);
      g.lineTo(cx + 0.34 * s, cy + 0.4 * s);
      g.lineTo(cx + 0.02 * s, cy + 0.4 * s);
      g.closePath();
      g.fill();
      break;
    case 'stock': // a shoulder pad on an arm
      box(-0.5, -0.1, 0.6, 0.2);
      box(0.1, -0.36, 0.22, 0.72);
      break;
    case 'mag': // a curved box
      box(-0.24, -0.42, 0.48, 0.16);
      g.beginPath();
      g.moveTo(cx - 0.22 * s, cy - 0.26 * s);
      g.lineTo(cx + 0.22 * s, cy - 0.26 * s);
      g.quadraticCurveTo(cx + 0.34 * s, cy + 0.2 * s, cx + 0.16 * s, cy + 0.44 * s);
      g.lineTo(cx - 0.26 * s, cy + 0.44 * s);
      g.quadraticCurveTo(cx - 0.3 * s, cy + 0.1 * s, cx - 0.22 * s, cy - 0.26 * s);
      g.closePath();
      g.fill();
      break;
    case 'optic': { // a scope with a reticle
      box(-0.5, -0.1, 1, 0.2);
      g.beginPath();
      g.arc(cx, cy, 0.3 * s, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.5)';
      g.lineWidth = Math.max(1, s * 0.04);
      g.beginPath();
      g.moveTo(cx - 0.22 * s, cy);
      g.lineTo(cx + 0.22 * s, cy);
      g.moveTo(cx, cy - 0.22 * s);
      g.lineTo(cx, cy + 0.22 * s);
      g.stroke();
      break;
    }
    default: { // functional — a lamp throwing a cone
      box(-0.4, -0.18, 0.34, 0.36);
      g.beginPath();
      g.moveTo(cx - 0.06 * s, cy - 0.18 * s);
      g.lineTo(cx + 0.44 * s, cy - 0.4 * s);
      g.lineTo(cx + 0.44 * s, cy + 0.4 * s);
      g.lineTo(cx - 0.06 * s, cy + 0.18 * s);
      g.closePath();
      g.fill();
    }
  }
  g.restore();
}

function cardTexture(a: Attachment): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext('2d')!;

  // Dark panel, green slot label, picture, name, price. One design for every
  // slot — colour-coding by slot turned the row into a paint chart.
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#0c1620');
  grad.addColorStop(1, '#060e13');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = 'rgba(255,255,255,0.16)';
  g.lineWidth = 4;
  g.strokeRect(6, 6, c.width - 12, c.height - 12);

  g.fillStyle = '#0ff796';
  g.font = 'bold 19px ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(a.cat.toUpperCase(), c.width / 2, 42);

  // The picture is an <img> laid over this area, so the texture draws the
  // plate it sits on — and a glyph on that plate, so a card whose picture
  // never arrives still reads as an item rather than as a blank hole.
  g.fillStyle = 'rgba(255,255,255,0.04)';
  g.fillRect(ART.x, ART.y, ART.w, ART.h);
  slotGlyph(g, a.cat, ART.x + ART.w / 2, ART.y + ART.h / 2, ART.h * 0.62);

  const size = a.name.length > 30 ? 21 : a.name.length > 20 ? 24 : 27;
  g.font = `600 ${size}px system-ui, sans-serif`;
  g.fillStyle = '#fafafa';
  const words = a.name.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (g.measureText(next).width > c.width - 40 && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  const lh = size * 1.2;
  lines.slice(0, 3).forEach((l, i) => g.fillText(l, c.width / 2, 404 + i * lh));

  g.fillStyle = '#5e7381';
  g.font = '600 20px ui-monospace, monospace';
  g.fillText(a.price.toLocaleString('en-US'), c.width / 2, c.height - 34);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* --------------------------------------------------------------- component */

export const CapsuleMachine = forwardRef<CapsuleHandle, Props>(function CapsuleMachine(
  { className, onCrank, onBounce, onOpen },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<CapsuleHandle | null>(null);
  const cb = useRef({ onCrank, onBounce, onOpen });
  cb.current = { onCrank, onBounce, onOpen };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduced ? 3 : 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15; // matched to the other scenes
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

    // Same rig as the roulette bowl, so the canvases read as one room.
    scene.add(new THREE.AmbientLight(0x8899bb, 1.05));
    const key = new THREE.DirectionalLight(0xfff2dd, 2.0);
    key.position.set(-5, 11, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -9;
    key.shadow.camera.right = 9;
    key.shadow.camera.top = 9;
    key.shadow.camera.bottom = -9;
    scene.add(key);
    const warm = new THREE.PointLight(0xffb056, 60, 30, 2);
    warm.position.set(4, 5, 4);
    scene.add(warm);
    const cool = new THREE.PointLight(0x5f8dff, 34, 30, 2);
    cool.position.set(-4, 3, -4);
    scene.add(cool);
    /** Fires inside the capsule as it splits. Dark until then. */
    const burst = new THREE.PointLight(0x0ff796, 0, 9, 2);
    scene.add(burst);

    const trash: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const keep = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
      trash.push(x);
      return x;
    };

    /* ------------------------------------------------------------ machine */
    const metal = keep(
      new THREE.MeshStandardMaterial({ color: 0x2a3a44, roughness: 0.42, metalness: 0.75 }),
    );
    const red = keep(
      new THREE.MeshStandardMaterial({ color: 0x9d2f28, roughness: 0.45, metalness: 0.3 }),
    );
    // Cleaner than before: at 0.22 the dome was a milky grey shell and the
    // gumballs behind it were barely there. Now it reads as glass — a rim
    // highlight and a sheen, with the contents plainly visible through it.
    const glass = keep(
      new THREE.MeshPhysicalMaterial({
        color: 0xeaf6ff,
        roughness: 0.02,
        metalness: 0,
        transparent: true,
        opacity: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: false, // or the dome hides everything inside it
      }),
    );

    const base = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.85, 2.1, 1.5, 40)), red);
    base.position.y = 0.75;
    base.castShadow = base.receiveShadow = true;
    scene.add(base);

    const collar = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.55, 1.85, 0.5, 40)), metal);
    collar.position.y = 1.72;
    collar.castShadow = true;
    scene.add(collar);

    const globe = new THREE.Mesh(keep(new THREE.SphereGeometry(GLOBE_R, 48, 32)), glass);
    globe.position.y = GLOBE_Y;
    scene.add(globe);

    /**
     * How far from the axis anything can sit at height `y` and still be inside
     * the glass, allowing for its own radius.
     *
     * Hand-picked ring radii are how the bottom row ended up sticking out
     * through the dome: a number that looks fine in isolation is wrong once
     * the sphere curves away above it. Deriving it means a ball can never
     * escape, whatever the layout below asks for.
     */
    const insideAt = (y: number, ownR = 0) => {
      const room = (GLOBE_R - ownR - 0.04) ** 2 - (y - GLOBE_Y) ** 2;
      return room > 0 ? Math.sqrt(room) : 0;
    };

    // The funnel the capsules actually sit on. Without it they hung in the
    // middle of the glass with nothing under them, which read as a bug rather
    // than as a machine.
    const FUNNEL_H = 1.15;
    const FUNNEL_Y = GLOBE_Y - GLOBE_R + 0.72;
    const funnel = new THREE.Mesh(
      // Sized to its own rim height, so the widest circle sits just inside the
      // glass rather than cutting through it.
      keep(new THREE.ConeGeometry(insideAt(FUNNEL_Y + FUNNEL_H / 2), FUNNEL_H, 44, 1, true)),
      keep(new THREE.MeshStandardMaterial({ color: 0x1d2a33, roughness: 0.55,
        metalness: 0.5, side: THREE.DoubleSide })),
    );
    funnel.rotation.x = Math.PI; // point down, so it feeds the middle
    funnel.position.y = FUNNEL_Y;
    funnel.receiveShadow = true;
    scene.add(funnel);

    const cap = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.55, 0.75, 0.35, 28)), metal);
    cap.position.y = GLOBE_Y + GLOBE_R - 0.1;
    cap.castShadow = true;
    scene.add(cap);

    // The tray the capsule lands in: a shallow open box facing the camera.
    const trayMat = metal;
    const tray = new THREE.Group();
    const floor = new THREE.Mesh(keep(new THREE.BoxGeometry(1.9, 0.12, 1.3)), trayMat);
    floor.receiveShadow = true;
    tray.add(floor);
    for (const [w, d, x, z] of [
      [1.9, 0.1, 0, -0.6],
      [0.1, 1.3, -0.9, 0],
      [0.1, 1.3, 0.9, 0],
    ] as const) {
      const wall = new THREE.Mesh(keep(new THREE.BoxGeometry(w, 0.55, d)), trayMat);
      wall.position.set(x, 0.28, z);
      wall.castShadow = wall.receiveShadow = true;
      tray.add(wall);
    }
    tray.position.set(0, TRAY_Y, TRAY_Z);
    scene.add(tray);

    // The chute the capsule comes out of. Previously it appeared at a point
    // INSIDE the solid base and travelled out through it, which is what made
    // the dispense look broken.
    const chute = new THREE.Mesh(
      keep(new THREE.BoxGeometry(1.05, 0.95, 0.5)),
      keep(new THREE.MeshStandardMaterial({ color: 0x11181e, roughness: 0.8, metalness: 0.2 })),
    );
    chute.position.set(0, CHUTE_Y, 1.72);
    scene.add(chute);
    const flap = new THREE.Mesh(
      keep(new THREE.BoxGeometry(1.05, 0.72, 0.06)),
      keep(new THREE.MeshPhysicalMaterial({ color: 0xbfd8e8, roughness: 0.1, metalness: 0,
        transparent: true, opacity: 0.4, clearcoat: 1 })),
    );
    flap.position.set(0, CHUTE_Y + 0.06, 1.99);
    scene.add(flap);

    // Crank, purely decorative but it turns when you pull the handle.
    const crank = new THREE.Group();
    const knob = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 24)), metal);
    knob.rotation.x = Math.PI / 2;
    crank.add(knob);
    const arm = new THREE.Mesh(keep(new THREE.BoxGeometry(0.14, 0.62, 0.14)), metal);
    arm.position.y = 0.3;
    crank.add(arm);
    crank.position.set(0, 1.05, 1.95);
    crank.children.forEach((m) => (m.castShadow = true));
    scene.add(crank);

    /* --------------------------------------------------- capsules in the globe */
    const stock: THREE.Mesh[] = [];
    const shellGeo = keep(new THREE.SphereGeometry(0.3, 20, 14));
    // Solid, not glass. See-through gumballs read as ghosts hanging in the
    // globe — the opaque ones catch the light, cast real shadows on each other
    // and sit in the heap like objects with weight.
    const shellMats = [0xe04a3a, 0x0ff796, 0x4aa8e0, 0xe0a23a, 0xa86ae0].map((c) =>
      keep(new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.28, metalness: 0.02,
        clearcoat: 0.9, clearcoatRoughness: 0.12 })),
    );
    // Hashed from the index rather than random, so the pile looks scattered but
    // sits identically on every mount instead of reshuffling on a re-render.
    const rnd = (i: number, s: number) => {
      const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    /**
     * A heap resting on the funnel, not a cloud hanging in the glass.
     *
     * Stacked in rings that narrow as they go up, with the funnel's own slope
     * setting the height of each ring, so every capsule is sitting on either
     * the cone or the ones below it.
     */
    const BALL_STOCK_R = 0.3;
    // Raised through the glass rather than pooled at the very bottom, so the
    // heap sits nearer the middle of the dome where the camera is actually
    // looking, instead of dragging the eye down into the base.
    const RINGS = [
      { n: 11, r: 1.62, y: 0.62 },
      { n: 9, r: 1.24, y: 1.0 },
      { n: 6, r: 0.86, y: 1.34 },
      { n: 3, r: 0.42, y: 1.64 },
      { n: 1, r: 0.0, y: 1.9 },
    ];
    const FLOOR_Y = GLOBE_Y - GLOBE_R + 0.5;
    let made = 0;
    for (const ring of RINGS) {
      for (let k = 0; k < ring.n; k++) {
        const m = new THREE.Mesh(shellGeo, shellMats[made % shellMats.length]);
        // Jitter hashed off the index, so the heap looks hand-filled but sits
        // identically on every mount instead of reshuffling on a re-render.
        const a = (k / ring.n) * Math.PI * 2 + rnd(made, 1) * 0.35;
        const y = FLOOR_Y + ring.y + (rnd(made, 3) - 0.5) * 0.05;
        // Clamped against the dome AFTER the jitter, so no amount of scatter
        // can push one through the glass.
        const r = Math.min(ring.r + (rnd(made, 2) - 0.5) * 0.12, insideAt(y, BALL_STOCK_R));
        m.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        m.castShadow = true;
        scene.add(m);
        stock.push(m);
        made++;
      }
    }

    /* ------------------------------------------------------- the capsule */
    // Two hemispheres and a clip band. Split as separate meshes in a group so
    // the halves can come apart at the seam.
    const capsule = new THREE.Group();
    const topMat = keep(
      new THREE.MeshPhysicalMaterial({
        color: 0xdff3ff, roughness: 0.05, metalness: 0, transparent: true,
        opacity: 0.34, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide,
      }),
    );
    const botMat = keep(
      new THREE.MeshPhysicalMaterial({
        color: 0x0ff796, roughness: 0.12, metalness: 0.05, transparent: true,
        opacity: 0.5, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide,
      }),
    );
    const topHalf = new THREE.Mesh(
      keep(new THREE.SphereGeometry(BALL_R, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2)),
      topMat,
    );
    const botHalf = new THREE.Mesh(
      keep(new THREE.SphereGeometry(BALL_R, 40, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)),
      botMat,
    );
    const band = new THREE.Mesh(
      keep(new THREE.TorusGeometry(BALL_R * 0.995, 0.055, 12, 44)),
      keep(new THREE.MeshStandardMaterial({ color: 0xc8a24a, roughness: 0.3, metalness: 0.85 })),
    );
    band.rotation.x = Math.PI / 2;
    topHalf.castShadow = botHalf.castShadow = band.castShadow = true;
    capsule.add(topHalf, botHalf, band);
    capsule.visible = false;
    scene.add(capsule);

    /* --------------------------------------------------------- particles */
    /**
     * The spray thrown out of the seam as it splits.
     *
     * One Points cloud rather than a mesh each: sixty sparks is sixty draw
     * calls the other way, and they only need to be dots of light.
     */
    const SPARKS = 60;
    const sparkPos = new Float32Array(SPARKS * 3);
    const sparkVel: THREE.Vector3[] = [];
    for (let i = 0; i < SPARKS; i++) sparkVel.push(new THREE.Vector3());
    const sparkGeo = keep(new THREE.BufferGeometry());
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = keep(
      new THREE.PointsMaterial({
        color: 0x0ff796,
        size: 0.11,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.frustumCulled = false;
    scene.add(sparks);
    let sparkLife = 0;

    /** Fires the spray from `at`, biased outward along the seam. */
    const popSparks = (at: THREE.Vector3) => {
      for (let i = 0; i < SPARKS; i++) {
        sparkPos[i * 3] = at.x;
        sparkPos[i * 3 + 1] = at.y;
        sparkPos[i * 3 + 2] = at.z;
        // Mostly sideways and up, the way a seam splitting would throw them,
        // rather than an even sphere which reads as an explosion.
        const a = Math.random() * Math.PI * 2;
        const up = 0.35 + Math.random() * 1.5;
        const out = 1.4 + Math.random() * 2.2;
        sparkVel[i].set(Math.cos(a) * out, up, Math.sin(a) * out * 0.7);
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkLife = 1;
    };

    // Home positions, so the shake can put every gumball back where it was.
    const stockHome = stock.map((m) => m.position.clone());

    /* ------------------------------------------------------------- cards */
    /**
     * A layer of real <img> elements sitting over the canvas, one per card.
     *
     * This is the only way the actual item art can appear: it is cross-origin,
     * and a cross-origin image is only usable as a WebGL texture when the host
     * sends CORS headers. Each one is tracked onto its card's projected
     * position every frame, so it moves, scales and fades with the card even
     * though it is not part of the scene.
     */
    const art = document.createElement('div');
    art.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none';
    mount.appendChild(art);

    const cardGeo = keep(new THREE.PlaneGeometry(CARD_W, CARD_H));
    interface Card {
      mesh: THREE.Mesh;
      tex: THREE.CanvasTexture;
      mat: THREE.MeshBasicMaterial;
      img: HTMLImageElement;
    }
    let cards: Card[] = [];
    const clearCards = () => {
      for (const c of cards) {
        scene.remove(c.mesh);
        c.tex.dispose();
        c.mat.dispose();
        c.img.remove();
      }
      cards = [];
    };

    /* ---------------------------------------------------------- animation */
    let t = -1; // seconds into the sequence; negative = idle
    let resolveRun: (() => void) | null = null;
    let lastArc = -1;
    let opened = false;
    let crankSpin = 0;

    let viewW = 1;
    let viewH = 1;
    let camDirty = true;
    /** 0 = the whole machine in frame, 1 = closed in on the capsule. */
    let focus = 0;


    api.current = {
      dispense: (all) =>
        new Promise<void>((resolve) => {
          const items = all.slice(0, MAX_CARDS);
          clearCards();
          items.forEach((a) => {
            const tex = cardTexture(a);
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
            const mesh = new THREE.Mesh(cardGeo, mat);
            // Folded away inside the capsule until it splits.
            mesh.scale.setScalar(0.001);
            mesh.position.set(0, OPEN_Y, OPEN_Z);
            scene.add(mesh);

            const src = attachImageSrc(a);
            const img = new Image();
            img.decoding = 'async';
            img.alt = '';
            img.style.cssText =
              'position:absolute;opacity:0;object-fit:contain;' +
              'filter:drop-shadow(0 2px 6px rgba(0,0,0,.6));will-change:transform,opacity';
            // The mirror in public/att/ is the only source. It is same-origin,
            // so nothing can refuse it — and when it has not been made yet the
            // element hides itself and the slot glyph drawn into the card
            // texture is what shows through.
            if (src) {
              img.onerror = () => {
                img.style.display = 'none';
              };
              img.src = src;
            } else {
              img.style.display = 'none';
            }
            art.appendChild(img);

            cards.push({ mesh, tex, mat, img });
          });

          // A different shell every time, so two pulls in a row do not look
          // like the same capsule played twice.
          const c = SHELL_COLORS[Math.floor(Math.random() * SHELL_COLORS.length)];
          botMat.color.setHex(c);
          band.visible = true;

          // Placed BEFORE it is shown. Making it visible first left it at its
          // last position for one frame, which flashed the previous capsule in
          // the middle of the screen every time you cranked.
          capsule.position.set(0, CHUTE_Y, 1.99);
          capsule.rotation.set(0, 0, 0);
          capsule.scale.setScalar(1);
          capsule.visible = false; // the shake comes first
          topHalf.position.set(0, 0, 0);
          topHalf.rotation.set(0, 0, 0);
          botHalf.position.set(0, 0, 0);
          t = 0;
          lastArc = -1;
          opened = false;
          resolveRun = resolve;
          cb.current.onCrank?.();
        }),

      reset: () => {
        t = -1;
        clearCards();
        resolveRun?.();
        resolveRun = null;
        capsule.visible = false;
        stock.forEach((m, i) => m.position.copy(stockHome[i]));
        sparkLife = 0;
        sparkMat.opacity = 0;
        focus = 0;
        camDirty = true;
      },
    };

    /* ------------------------------------------------------------ framing */
    const reframe = () => {
      // Wide on the machine, closing in on the capsule as it rises. There is no
      // row of cards in the scene any more, so nothing else has to fit.
      /**
       * The whole machine, plus dead space underneath it.
       *
       * The frame is centred on the box, so padding the bottom lifts the
       * machine into the upper part of the canvas and leaves the lower strip
       * for the revealed cards to sit over. Without it the cards covered the
       * base, and closing the camera in on them cropped the machine and left a
       * hole beneath it.
       */
      // Widens as the row appears, so five cards and the whole machine share
      // the shot instead of the camera cropping one to fit the other.
      const halfRow = ((MAX_CARDS - 1) / 2) * CARD_GAP + CARD_W / 2 + 0.2;
      const wide = {
        min: new THREE.Vector3(-2.6, -0.2, -2.4),
        max: new THREE.Vector3(2.6, GLOBE_Y + GLOBE_R + 0.4, TRAY_Z + 1.2),
      };
      /**
       * Closed in on the row, which sits mid-frame where the capsule split.
       *
       * The bottom stays pinned at the machine's base rather than following
       * the cards: letting it ride up cropped the machine and left a band of
       * empty felt underneath, which is exactly what it should not do.
       */
      const close = {
        min: new THREE.Vector3(-halfRow, CLOSE_FLOOR - CLOSE_PAD, -0.8),
        max: new THREE.Vector3(halfRow, CARD_Y + CARD_H / 2 + 0.15, CARD_Z + 1.1),
      };
      const e = smooth(focus);
      frameCamera(
        camera,
        { min: wide.min.clone().lerp(close.min, e), max: wide.max.clone().lerp(close.max, e) },
        { tilt: CAM_TILT, width: viewW, height: viewH, margin: 1.04 },
      );
    };

    const projA = new THREE.Vector3();
    const projB = new THREE.Vector3();

    let dirty = true;
    const running = () => (t >= 0 && t < T_TOTAL) || sparkLife > 0;
    const settling = () => focus !== (t >= T_DROP + T_SETTLE + T_RISE ? 1 : 0);

    const frame = (_now: number, dt: number) => {
      const step = dt * speed;

      if (t >= 0 && t < T_TOTAL) {
        t = Math.min(T_TOTAL, t + step);

        // --- 0. work the globe before anything comes out -----------------
        // The capsules jostle in place: a real machine does not simply emit a
        // ball, it is shaken until one drops.
        if (t < T_SHAKE) {
          const u = clamp01(t / T_SHAKE);
          const decay = 1 - u * 0.55;
          const swing = Math.sin(u * Math.PI * 11) * decay;
          globe.position.x = swing * 0.05;
          funnel.position.x = swing * 0.05;
          for (const [i, m] of stock.entries()) {
            const h = stockHome[i];
            const ph = i * 1.7;
            m.position.set(
              h.x + Math.sin(u * 24 + ph) * 0.13 * decay + swing * 0.05,
              h.y + Math.abs(Math.sin(u * 19 + ph)) * 0.1 * decay,
              h.z + Math.cos(u * 21 + ph) * 0.13 * decay,
            );
            // Still inside the dome, however hard it is shaken.
            const lim = insideAt(m.position.y, BALL_STOCK_R);
            const r = Math.hypot(m.position.x, m.position.z);
            if (r > lim) {
              m.position.x *= lim / r;
              m.position.z *= lim / r;
            }
          }
          if (Math.floor(u * 9) !== lastArc) {
            lastArc = Math.floor(u * 9);
            cb.current.onBounce?.(0.25 * decay);
          }
        }
        // --- 1. fall out of the chute and bounce into the tray ------------
        else if (t < T_SHAKE + T_DROP) {
          if (!capsule.visible) {
            capsule.visible = true;
            globe.position.x = 0;
            funnel.position.x = 0;
            stock.forEach((m, i) => m.position.copy(stockHome[i]));
            lastArc = -1;
          }
          const u = clamp01((t - T_SHAKE) / T_DROP);
          const { h, arc } = hops(u);
          // Out of the chute mouth, then bouncing in the tray in front of it —
          // the whole path is outside the machine's body.
          capsule.position.set(
            0,
            TRAY_Y + 0.16 + BALL_R + (CHUTE_Y - TRAY_Y) * h,
            THREE.MathUtils.lerp(1.99, TRAY_Z + 0.62, easeOut(u)),
          );
          capsule.rotation.z = u * 5.2;
          if (arc !== lastArc && arc > 0 && arc < 4) {
            cb.current.onBounce?.(Math.pow(0.55, arc - 1));
          }
          lastArc = arc;
        }
        // --- 2. sit in the tray ------------------------------------------
        else if (t < T_SHAKE + T_DROP + T_SETTLE) {
          capsule.position.set(0, TRAY_Y + 0.16 + BALL_R, TRAY_Z + 0.62);
        }
        // --- 3. float up to the middle -----------------------------------
        else if (t < T_SHAKE + T_DROP + T_SETTLE + T_RISE) {
          const u = clamp01((t - T_SHAKE - T_DROP - T_SETTLE) / T_RISE);
          const e = easeInOut(u);
          capsule.position.set(
            0,
            THREE.MathUtils.lerp(TRAY_Y + 0.16 + BALL_R, OPEN_Y, e),
            THREE.MathUtils.lerp(TRAY_Z + 0.62, OPEN_Z, e),
          );
          capsule.rotation.z = 5.2 * (1 - e);
          capsule.scale.setScalar(1 + (OPEN_SCALE - 1) * e);
          focus = e;
          camDirty = true;
        }
        // --- 4. unclip ----------------------------------------------------
        else if (t < T_SHAKE + T_DROP + T_SETTLE + T_RISE + T_OPEN) {
          const u = clamp01((t - T_SHAKE - T_DROP - T_SETTLE - T_RISE) / T_OPEN);
          const e = easeOut(u);
          if (!opened) {
            opened = true;
            popSparks(capsule.position);
            cb.current.onOpen?.();
          }
          // The halves come apart at the seam and tip away from each other.
          topHalf.position.y = 0.55 * e;
          topHalf.rotation.x = -0.9 * e;
          botHalf.position.y = -0.35 * e;
          band.visible = e < 0.35;
          burst.position.copy(capsule.position);
          burst.intensity = 22 * Math.sin(Math.PI * u);
        }
        // --- 5. the contents fly out and square up to the camera ----------
        else {
          const u = clamp01((t - T_SHAKE - T_DROP - T_SETTLE - T_RISE - T_OPEN) / T_FLY);
          const e = easeOut(u);
          burst.intensity = 22 * (1 - u) * 0.4;
          capsule.scale.setScalar(OPEN_SCALE * (1 - smooth(u)));
          // Stays closed in: the row is the subject now, and pulling back
          // would shrink the cards just as they arrive.
          focus = 1;
          camDirty = true;
          const n = cards.length;
          cards.forEach((c, i) => {
            const x = (i - (n - 1) / 2) * CARD_GAP;
            c.mesh.position.set(
              THREE.MathUtils.lerp(0, x, e),
              THREE.MathUtils.lerp(OPEN_Y, CARD_Y, e) + Math.sin(Math.PI * u) * 0.5,
              THREE.MathUtils.lerp(OPEN_Z, CARD_Z, e),
            );
            c.mesh.scale.setScalar(0.001 + e);
            // Squared to the camera, then spun on top, so however the frame is
            // angled they arrive flat-on rather than at a guessed tilt.
            c.mesh.lookAt(camera.position);
            c.mesh.rotateY((1 - e) * Math.PI * 1.6);
          });
          if (t >= T_TOTAL) {
            capsule.visible = false;
            burst.intensity = 0;
            resolveRun?.();
            resolveRun = null;
          }
        }
      } else if (t < 0) {
        // Idle: the capsules in the globe drift, so the machine is not a
        // still photograph while you decide.
        for (const [i, m] of stock.entries()) {
          m.position.y += Math.sin(performance.now() / 900 + i) * 0.00035;
          // Drifting upward shrinks the room available at that height, so the
          // clamp has to be re-applied rather than only done at build time.
          const lim = insideAt(m.position.y, BALL_STOCK_R);
          const r = Math.hypot(m.position.x, m.position.z);
          if (r > lim) {
            m.position.x *= lim / r;
            m.position.z *= lim / r;
          }
        }
        crankSpin *= 0.94;
      }

      // Keep them square to the camera while the frame is still easing.
      if (t >= T_TOTAL && cards.length) {
        for (const c of cards) c.mesh.lookAt(camera.position);
      }

      /**
       * Track each picture onto its card.
       *
       * Projected rather than parented: the card is a plane in the scene and
       * the picture is an element on the page, so the only thing connecting
       * them is where the card's face lands on screen this frame. Two points
       * are projected — the face centre and its top edge — which gives both
       * position and scale without assuming anything about the camera.
       */
      if (cards.length) {
        const reveal = clamp01((t - (T_TOTAL - T_FLY * 0.55)) / (T_FLY * 0.55));
        for (const c of cards) {
          const img = c.img;
          if (img.style.display === 'none' || !img.naturalWidth) continue;
          const s0 = projA.set(0, 0, 0).applyMatrix4(c.mesh.matrixWorld).project(camera);
          const s1 = projB.set(0, CARD_H / 2, 0).applyMatrix4(c.mesh.matrixWorld).project(camera);
          const cx = (s0.x * 0.5 + 0.5) * viewW;
          const cy = (-s0.y * 0.5 + 0.5) * viewH;
          const halfPx = Math.abs((-s1.y * 0.5 + 0.5) * viewH - cy);
          if (!Number.isFinite(halfPx) || halfPx < 1) continue;

          // The art plate occupies a fixed band of the card face; convert
          // that band to pixels and sit the picture in the middle of it.
          const pxPerFaceY = (halfPx * 2) / TEX_H;
          const boxH = ART.h * pxPerFaceY;
          const boxW = ART.w * pxPerFaceY * (CARD_W / CARD_H) * (TEX_H / TEX_W);
          const midY = cy + ((ART.y + ART.h / 2) / TEX_H - 0.5) * halfPx * 2;
          img.style.width = `${boxW}px`;
          img.style.height = `${boxH}px`;
          img.style.left = `${cx - boxW / 2}px`;
          img.style.top = `${midY - boxH / 2}px`;
          // Held back until the card has nearly finished turning — a flat
          // overlay on a card still edge-on would slide about on top of it.
          img.style.opacity = String(reveal);
        }
      }

      // Sparks fall away under their own gravity and fade out.
      if (sparkLife > 0) {
        sparkLife = Math.max(0, sparkLife - step / 0.9);
        for (let i = 0; i < SPARKS; i++) {
          sparkVel[i].y -= 5.2 * step;
          sparkPos[i * 3] += sparkVel[i].x * step;
          sparkPos[i * 3 + 1] += sparkVel[i].y * step;
          sparkPos[i * 3 + 2] += sparkVel[i].z * step;
        }
        sparkGeo.attributes.position.needsUpdate = true;
        sparkMat.opacity = sparkLife;
        sparkMat.size = 0.05 + 0.09 * sparkLife;
      } else if (sparkMat.opacity !== 0) {
        sparkMat.opacity = 0;
      }

      crank.rotation.z = crankSpin;
      if (t >= 0 && t < T_DROP) crank.rotation.z = -t * 9;

      if (camDirty || running()) {
        camDirty = running() || settling();
        reframe();
      }

      // Always drawing while the sequence runs; otherwise only when something
      // changed, so an idle stage costs nothing.
      if (running() || dirty || t < 0) {
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
      loop.stop();
      ro.disconnect();
      clearCards();
      art.remove();
      trash.forEach((x) => x.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      api.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    dispense: (items: Attachment[]) => api.current?.dispense(items) ?? Promise.resolve(),
    reset: () => api.current?.reset(),
  }));

  return <div ref={mountRef} className={className} />;
});
