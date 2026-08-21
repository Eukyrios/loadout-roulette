/**
 * A fanned deck of keycards, for deciding which locked rooms you are going in
 * for.
 *
 * The fan is face-down and stays face-down: you take a card blind, and only
 * once it has left the fan and turned over do you find out which door it
 * opens. Up to five come out, and they line up in front of the deck so the
 * whole hand stays readable.
 *
 * Same deal as the wheel, the dice and the cup — the caller decides which key
 * a card carries (seeded, so a shared link reproduces the hand) and this
 * animates the card that says so. The fan itself is just the theatre.
 *
 * The face texture is painted per draw rather than up front: the deck is a
 * different set of rooms on every map, and pre-rendering seventeen canvases
 * for a hand of five would be most of the work thrown away.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { frameCamera } from './frame';
import { renderLoop } from './renderLoop';

export interface CardFanHandle {
  /** Pull a card out of the fan into hand `slot`, revealing `label`. */
  draw: (slot: number, label: string) => Promise<void>;
  /** Put every card back, face-down. */
  reset: () => void;
}

interface Props {
  className?: string;
  /** Fired as the card breaks out of the fan. */
  onSlide?: () => void;
  /** Fired at the moment it turns over. */
  onFlip?: () => void;
}

/** How many cards are in the fan. The deck of ROOMS may be a different size —
 *  this is the prop, not the data. */
const FAN_COUNT = 12;
/** Most cards you can have in hand. Mirrors MAX_KEYS. */
const HAND = 5;

const CARD_W = 1.9;
const CARD_H = 2.7;
const CARD_T = 0.035;
/** Radians between neighbouring cards in the fan. */
const SPREAD = 0.17;
/** Where the fan pivots, and how far the cards sit from it. */
const PIVOT_Z = 0.7;
const ARM = 1.35;
const FLOOR = 0.06;
/** Cards in hand are laid smaller so five of them still fit the frame. */
const HAND_SCALE = 0.72;
const HAND_GAP = 1.42;
const HAND_Z = 2.5;

const DRAW_MS = 1250;

const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

/** A near-level view, so the fan reads as a fan rather than a row of lines. */
const CAM_TILT = (50 * Math.PI) / 180;

/* ------------------------------------------------------------------ faces */

/**
 * The back of every card: a dark panel with the house diamond on it. One
 * texture shared by the whole deck.
 */
function backTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 376;
  const g = c.getContext('2d')!;

  g.fillStyle = '#12181f';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#c8a24a';
  g.lineWidth = 6;
  g.strokeRect(11, 11, c.width - 22, c.height - 22);
  g.strokeStyle = 'rgba(200,162,74,0.35)';
  g.lineWidth = 2;
  g.strokeRect(24, 24, c.width - 48, c.height - 48);

  // A lattice of diamonds, the way a card back is normally patterned.
  g.strokeStyle = 'rgba(120, 220, 170, 0.18)';
  g.lineWidth = 2;
  for (let y = 40; y < c.height - 40; y += 34) {
    for (let x = 40; x < c.width - 40; x += 34) {
      g.beginPath();
      g.moveTo(x, y - 11);
      g.lineTo(x + 11, y);
      g.lineTo(x, y + 11);
      g.lineTo(x - 11, y);
      g.closePath();
      g.stroke();
    }
  }

  g.fillStyle = '#c8a24a';
  g.font = 'bold 30px ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('DF', c.width / 2, c.height / 2);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** The face of one card: KEYCARD, then the room it opens, wrapped to fit. */
function faceTexture(label: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 376;
  const g = c.getContext('2d')!;

  g.fillStyle = '#e9e6dc';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#1b2a24';
  g.lineWidth = 5;
  g.strokeRect(10, 10, c.width - 20, c.height - 20);

  g.fillStyle = '#2f6f52';
  g.fillRect(10, 10, c.width - 20, 52);
  g.fillStyle = '#f2f0e8';
  g.font = 'bold 20px ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('KEYCARD', c.width / 2, 37);

  // Greedy wrap. Long room names are the norm here, not the exception, so the
  // type size steps down as the name gets longer rather than overflowing.
  const words = label.split(' ');
  const size = label.length > 30 ? 20 : label.length > 20 ? 23 : 27;
  g.font = `600 ${size}px system-ui, sans-serif`;
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (g.measureText(next).width > c.width - 44 && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  g.fillStyle = '#16211c';
  const lh = size * 1.28;
  const top = c.height / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => g.fillText(l, c.width / 2, top + i * lh));

  g.strokeStyle = '#2f6f52';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(48, c.height - 52);
  g.lineTo(c.width - 48, c.height - 52);
  g.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ------------------------------------------------------------ component */

export const CardFan = forwardRef<CardFanHandle, Props>(function CardFan(
  { className, onSlide, onFlip },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<CardFanHandle | null>(null);
  const cb = useRef({ onSlide, onFlip });
  cb.current = { onSlide, onFlip };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 420 : DRAW_MS;

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
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    scene.add(key);
    const warm = new THREE.PointLight(0xffb056, 60, 30, 2);
    warm.position.set(4, 5, 4);
    scene.add(warm);
    const cool = new THREE.PointLight(0x5f8dff, 34, 30, 2);
    cool.position.set(-4, 3, -4);
    scene.add(cool);

    const trash: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const keep = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
      trash.push(x);
      return x;
    };

    /* ------------------------------------------------------------ table */
    const felt = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(6.4, 6.6, 0.3, 64)),
      keep(new THREE.MeshStandardMaterial({ color: 0x16342a, roughness: 0.94, metalness: 0.02 })),
    );
    felt.position.y = -0.15;
    felt.receiveShadow = true;
    scene.add(felt);

    const rail = new THREE.Mesh(
      keep(new THREE.TorusGeometry(6.5, 0.22, 16, 80)),
      keep(new THREE.MeshStandardMaterial({ color: 0x3b2717, roughness: 0.55, metalness: 0.3 })),
    );
    rail.rotation.x = Math.PI / 2;
    rail.receiveShadow = true;
    scene.add(rail);

    /* ------------------------------------------------------------ cards */
    const back = keep(backTexture());
    const edgeMat = keep(
      new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 0.7, metalness: 0.02 }),
    );
    const backMat = keep(
      new THREE.MeshStandardMaterial({ map: back, roughness: 0.62, metalness: 0.05 }),
    );
    // Blank until the card is drawn — a face texture is painted then.
    const blankFace = keep(
      new THREE.MeshStandardMaterial({ color: 0xe9e6dc, roughness: 0.7, metalness: 0.02 }),
    );
    const cardGeo = keep(new THREE.BoxGeometry(CARD_W, CARD_T, CARD_H));

    /**
     * Box material order is +x, -x, +y, -y, +z, -z. The card lies flat, so
     * index 2 is the face and index 3 is the back — get those two the wrong way
     * round and the deck sits face-up on the table.
     */
    interface Card {
      mesh: THREE.Mesh;
      home: THREE.Vector3;
      homeQ: THREE.Quaternion;
      /** Set once the card has been taken; drives where it rests. */
      hand: number;
      face: THREE.CanvasTexture | null;
    }

    const cards: Card[] = [];
    const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);

    for (let i = 0; i < FAN_COUNT; i++) {
      const a = (i - (FAN_COUNT - 1) / 2) * SPREAD;
      const mesh = new THREE.Mesh(cardGeo, [
        edgeMat,
        edgeMat,
        blankFace.clone(),
        backMat,
        edgeMat,
        edgeMat,
      ]);
      trash.push((mesh.material as THREE.Material[])[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Stacked by a hair so neighbours in the fan do not z-fight, and so the
      // fan reads as overlapping paper rather than one flat shape.
      const home = new THREE.Vector3(
        Math.sin(a) * ARM,
        FLOOR + i * 0.014,
        PIVOT_Z - Math.cos(a) * ARM,
      );
      // Yaw into the fan, THEN roll face-down. Composed the other way round
      // the flip happens in world space and the fan splays the wrong way.
      const homeQ = new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 1, 0), a)
        .multiply(flip);

      mesh.position.copy(home);
      mesh.quaternion.copy(homeQ);
      scene.add(mesh);
      cards.push({ mesh, home, homeQ, hand: -1, face: null });
    }

    /**
     * Where a card in hand slot `n` rests, given how many cards are in hand.
     *
     * The row is centred on however many have been drawn, not on the five it
     * could hold — a single card belongs in the middle of the table, not
     * stranded out at the left-hand end of an empty row. The cards already
     * down shuffle across to make room as the hand grows.
     */
    const handPos = (n: number, count: number) =>
      new THREE.Vector3((n - (count - 1) / 2) * HAND_GAP, FLOOR + 0.02, HAND_Z);
    // Tipped a touch away from level, so the face catches the key light.
    const handQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.08);

    /* --------------------------------------------------------- animation */
    interface Mover {
      card: Card;
      from: THREE.Vector3;
      fromQ: THREE.Quaternion;
      fromS: number;
      to: THREE.Vector3;
      /** Only the card being taken arcs over the others. */
      lift: boolean;
    }

    let movers: Mover[] = [];
    let startedAt = 0;
    let flipped = false;
    let resolveDraw: (() => void) | null = null;

    /**
     * How much of the table the camera has to cover, in cards. Eased rather
     * than set, because it drives the framing: an empty hand should not leave
     * the fan marooned at the top of a frame reserved for five cards that are
     * not there, and a hand that appears one card at a time should open the
     * shot out at the same pace.
     */
    let shownCount = 0;
    let targetCount = 0;
    let viewW = 1;
    let viewH = 1;
    let camDirty = true;

    api.current = {
      draw: (slot: number, label: string) =>
        new Promise<void>((resolve) => {
          // Take from the top of the fan inward, so the shape stays tidy as it
          // empties instead of developing gaps in the middle.
          const card = cards.filter((c) => c.hand < 0).pop();
          if (!card) {
            resolve();
            return;
          }

          card.face?.dispose();
          card.face = faceTexture(label);
          const mats = card.mesh.material as THREE.MeshStandardMaterial[];
          mats[2].map = card.face;
          mats[2].needsUpdate = true;

          const placed = cards.filter((c) => c.hand >= 0).sort((a, b) => a.hand - b.hand);
          card.hand = Math.max(0, Math.min(HAND - 1, slot));
          const count = placed.length + 1;

          movers = [
            {
              card,
              from: card.mesh.position.clone(),
              fromQ: card.mesh.quaternion.clone(),
              fromS: card.mesh.scale.x,
              to: handPos(card.hand, count),
              lift: true,
            },
            // Everything already down slides across to keep the row centred.
            ...placed.map((c, i) => ({
              card: c,
              from: c.mesh.position.clone(),
              fromQ: c.mesh.quaternion.clone(),
              fromS: c.mesh.scale.x,
              to: handPos(i, count),
              lift: false,
            })),
          ];

          targetCount = count;
          startedAt = performance.now();
          flipped = false;
          resolveDraw = resolve;
          cb.current.onSlide?.();
        }),

      reset: () => {
        movers = [];
        resolveDraw?.();
        resolveDraw = null;
        targetCount = 0;
        for (const c of cards) {
          c.hand = -1;
          c.mesh.position.copy(c.home);
          c.mesh.quaternion.copy(c.homeQ);
          c.mesh.scale.set(1, 1, 1);
          c.face?.dispose();
          c.face = null;
          const mats = c.mesh.material as THREE.MeshStandardMaterial[];
          mats[2].map = null;
          mats[2].needsUpdate = true;
        }
      },
    };

    /* ------------------------------------------------------------- framing */
    const fanZMin = PIVOT_Z - ARM - CARD_H / 2 - 0.25;
    const fanZMax = PIVOT_Z + CARD_H * 0.2;
    const handZMax = HAND_Z + (CARD_H * HAND_SCALE) / 2 + 0.25;
    const fanHalfX = Math.sin(((FAN_COUNT - 1) / 2) * SPREAD) * ARM + CARD_W * 0.62;

    const reframe = () => {
      const open = clamp01(shownCount);
      const halfHand =
        ((Math.max(1, shownCount) - 1) / 2) * HAND_GAP + (CARD_W * HAND_SCALE) / 2 + 0.25;
      frameCamera(
        camera,
        {
          min: new THREE.Vector3(-Math.max(fanHalfX, halfHand), -0.2, fanZMin),
          max: new THREE.Vector3(
            Math.max(fanHalfX, halfHand),
            0.9,
            fanZMax + (handZMax - fanZMax) * open,
          ),
        },
        { tilt: CAM_TILT, width: viewW, height: viewH, margin: 1.04 },
      );
    };

    // Still between draws, so it only draws while a card is moving or the
    // framing is still opening out — plus once more after a resize.
    let dirty = true;
    const settled = () => movers.length === 0 && shownCount === targetCount;
    const frame = (now: number, dt: number) => {

      if (movers.length) {
        const u = clamp01((now - startedAt) / duration);
        const e = easeInOut(u);

        for (const m of movers) {
          m.card.mesh.position.lerpVectors(m.from, m.to, e);
          if (m.lift) {
            // Arced clear of the fan on the way across, so it slides over its
            // neighbours rather than through them.
            m.card.mesh.position.y += Math.sin(Math.PI * u) * 0.75;
            m.card.mesh.quaternion.slerpQuaternions(m.fromQ, handQ, e);
          }
          const s = m.fromS + (HAND_SCALE - m.fromS) * e;
          m.card.mesh.scale.set(s, 1, s);
        }

        // The turn happens around the halfway point of the arc; that is the
        // beat the sound belongs on.
        if (!flipped && u > 0.45) {
          flipped = true;
          cb.current.onFlip?.();
        }

        if (u >= 1) {
          movers = [];
          resolveDraw?.();
          resolveDraw = null;
        }
      }

      // Framing follows the hand, easing over roughly one draw.
      if (shownCount !== targetCount || camDirty) {
        const step = (dt * 1000) / duration;
        shownCount =
          targetCount > shownCount
            ? Math.min(targetCount, shownCount + step)
            : Math.max(targetCount, shownCount - step * 2);
        camDirty = shownCount !== targetCount;
        reframe();
      }

      if (!settled() || dirty) {
        dirty = false;
        renderer.render(scene, camera);
      }
    };
    const loop = renderLoop(mount, frame, () => !settled(), () => {
      dirty = true;
    });

    /* ------------------------------------------------------------ sizing */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      viewW = w;
      viewH = h;
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
      cards.forEach((c) => c.face?.dispose());
      trash.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      api.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    draw: (slot: number, label: string) => api.current?.draw(slot, label) ?? Promise.resolve(),
    reset: () => api.current?.reset(),
  }));

  return <div ref={mountRef} className={className} />;
});
