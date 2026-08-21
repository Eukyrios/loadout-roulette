/**
 * A cup of fortune sticks, for drawing squad size.
 *
 * Twelve sticks sit fanned in a glass. Shake the cup, and one rises out and
 * stands proud so you can read its painted bands: one for Solo, two for Duo,
 * three for Trio.
 *
 * Like the wheel and the dice, the draw is choreographed rather than
 * simulated — the caller decides which stick wins (seeded, so a shared link
 * reproduces it) and this animates that stick out of the cup. Simulating a
 * bundle of sticks colliding would be a physics problem with a non-reproducible
 * answer, which is the wrong trade for a tool people share links to.
 *
 * The arrangement jitter is hashed from each stick's index rather than taken
 * from Math.random, so the bundle looks scattered but sits identically on every
 * mount instead of reshuffling under the user on a re-render.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { SQUAD_BY_ID, STICK_BUNDLE } from '../data/deltaforce';
import { frameCamera } from './frame';

export interface StickHandle {
  /** Shake, then draw the stick at `index` in STICK_BUNDLE. */
  draw: (index: number) => Promise<void>;
}

interface Props {
  className?: string;
  /** Fired repeatedly while the cup is being shaken. */
  onRattle?: (strength: number) => void;
  /** Fired the moment the winning stick starts to rise. */
  onDraw?: () => void;
}

const COUNT = STICK_BUNDLE.length;
const STICK_LEN = 4.2;
const STICK_R = 0.062;
const CUP_H = 2.9;
const CUP_TOP_R = 1.5;
const CUP_BOT_R = 1.18;
const FLOOR = 0.12;
const RISE = 2.05;

const DRAW_MS = 2700;
/** Fraction of the animation spent shaking before the stick lifts. */
const SHAKE = 0.62;

const CAM_TILT = (72 * Math.PI) / 180; // from straight down — a near-level view

const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
const easeOutCubic = (u: number) => 1 - Math.pow(1 - u, 3);
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

/** Deterministic 0..1 from an index — stable jitter without Math.random. */
function hash(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const StickCup = forwardRef<StickHandle, Props>(function StickCup(
  { className, onRattle, onDraw },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ draw: (i: number) => Promise<void> } | null>(null);
  const cb = useRef({ onRattle, onDraw });
  cb.current = { onRattle, onDraw };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 800 : DRAW_MS;

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

    // Same rig as the roulette bowl so the canvases read as one room.
    scene.add(new THREE.AmbientLight(0x8899bb, 1.05));
    const key = new THREE.DirectionalLight(0xfff2dd, 2.0);
    key.position.set(-5, 11, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    const warm = new THREE.PointLight(0xffb056, 60, 30, 2);
    warm.position.set(4, 5, 4);
    scene.add(warm);
    const cool = new THREE.PointLight(0x5f8dff, 34, 30, 2);
    cool.position.set(-4, 3, -4);
    scene.add(cool);

    const trash: (THREE.BufferGeometry | THREE.Material)[] = [];
    const keep = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
      trash.push(x);
      return x;
    };

    /* ---------------------------------------------------------- the table */
    const matBase = keep(
      new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.8, metalness: 0.15 }),
    );
    const baseGeo = keep(new THREE.CylinderGeometry(2.5, 2.7, 0.22, 48));
    const base = new THREE.Mesh(baseGeo, matBase);
    base.position.y = -0.11;
    base.receiveShadow = true;
    scene.add(base);

    /* ------------------------------------------------------------ the cup */
    // Shaken as a unit, so the sticks are parented to it.
    const cup = new THREE.Group();
    scene.add(cup);

    const glassMat = keep(
      new THREE.MeshPhysicalMaterial({
        color: 0xbfd8e4,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      }),
    );
    const wallGeo = keep(
      new THREE.CylinderGeometry(CUP_TOP_R, CUP_BOT_R, CUP_H, 48, 1, true),
    );
    const wall = new THREE.Mesh(wallGeo, glassMat);
    wall.position.y = CUP_H / 2;
    cup.add(wall);

    const brass = keep(
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.26, metalness: 1 }),
    );
    const rimGeo = keep(new THREE.TorusGeometry(CUP_TOP_R, 0.055, 12, 56));
    const rim = new THREE.Mesh(rimGeo, brass);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = CUP_H;
    cup.add(rim);

    const footGeo = keep(new THREE.CylinderGeometry(CUP_BOT_R + 0.1, CUP_BOT_R + 0.16, 0.16, 48));
    const foot = new THREE.Mesh(footGeo, brass);
    foot.position.y = 0.08;
    foot.castShadow = true;
    cup.add(foot);

    const floorGeo = keep(new THREE.CircleGeometry(CUP_BOT_R, 40));
    const cupFloor = new THREE.Mesh(
      floorGeo,
      keep(new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.9 })),
    );
    cupFloor.rotation.x = -Math.PI / 2;
    cupFloor.position.y = FLOOR;
    cup.add(cupFloor);

    /* --------------------------------------------------------- the sticks */
    const bambooMat = keep(
      new THREE.MeshStandardMaterial({ color: 0xd9c08a, roughness: 0.62, metalness: 0.05 }),
    );
    const bandMat = keep(
      new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 0.7, metalness: 0.1 }),
    );
    // Origin at the BOTTOM of the stick, so leaning it fans from the cup floor
    // rather than pivoting through its middle.
    const bodyGeo = keep(new THREE.CylinderGeometry(STICK_R, STICK_R, STICK_LEN, 10));
    bodyGeo.translate(0, STICK_LEN / 2, 0);
    const tipGeo = keep(new THREE.CylinderGeometry(STICK_R * 1.12, STICK_R * 1.12, 0.46, 10));
    const bandGeo = keep(new THREE.CylinderGeometry(STICK_R * 1.16, STICK_R * 1.16, 0.075, 10));

    interface Stick {
      group: THREE.Group;
      home: THREE.Vector3;
      homeQ: THREE.Quaternion;
    }
    const sticks: Stick[] = [];
    const tipMats: THREE.Material[] = [];

    STICK_BUNDLE.forEach((id, i) => {
      const size = SQUAD_BY_ID[id];
      const g = new THREE.Group();

      const body = new THREE.Mesh(bodyGeo, bambooMat);
      body.castShadow = true;
      g.add(body);

      const tipMat = new THREE.MeshStandardMaterial({
        color: (size?.attrs?.tip as number) ?? 0xffffff,
        roughness: 0.4,
        metalness: 0.2,
      });
      tipMats.push(tipMat);
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.y = STICK_LEN - 0.23;
      tip.castShadow = true;
      g.add(tip);

      // One band per squad member — the result stays readable without colour.
      const bands = Number(size?.attrs?.bands ?? 1);
      for (let b = 0; b < bands; b++) {
        const ring = new THREE.Mesh(bandGeo, bandMat);
        ring.position.y = STICK_LEN - 0.62 - b * 0.16;
        g.add(ring);
      }

      // Fanned: spread around the cup, each leaning outward along its radius.
      const a = (i / COUNT) * Math.PI * 2 + hash(i, 1) * 0.22;
      const r = 0.28 + hash(i, 2) * 0.62;
      g.position.set(r * Math.cos(a), FLOOR, r * Math.sin(a));

      const lean = 0.06 + hash(i, 3) * 0.1;
      const axis = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
      g.quaternion.setFromAxisAngle(axis, lean);

      cup.add(g);
      sticks.push({
        group: g,
        home: g.position.clone(),
        homeQ: g.quaternion.clone(),
      });
    });
    tipMats.forEach((m) => trash.push(m));

    /* ------------------------------------------------------------ animate */
    let drawing = false;
    let startedAt = 0;
    let chosen = 0;
    let resolveDraw: (() => void) | null = null;
    let nextRattle = 0;
    /** Where the drawn stick ends up: centred, raised, tipped toward camera. */
    const outPos = new THREE.Vector3(0, FLOOR + RISE, 0.55);
    const outQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.2);

    api.current = {
      draw: (index: number) =>
        new Promise<void>((resolve) => {
          chosen = ((index % COUNT) + COUNT) % COUNT;
          // Put everything back before shaking again.
          sticks.forEach((s) => {
            s.group.position.copy(s.home);
            s.group.quaternion.copy(s.homeQ);
          });
          startedAt = performance.now();
          drawing = true;
          nextRattle = 0;
          resolveDraw = resolve;
        }),
    };

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      if (drawing) {
        const u = clamp01((now - startedAt) / duration);

        if (u < SHAKE) {
          const k = u / SHAKE;
          // Fast rocking that loses energy — the cup being worked, not waved.
          const decay = 1 - k * 0.55;
          const swing = Math.sin(k * Math.PI * 9) * 0.17 * decay;
          cup.rotation.z = swing;
          cup.rotation.x = Math.cos(k * Math.PI * 7.4) * 0.09 * decay;
          cup.position.y = Math.abs(Math.sin(k * Math.PI * 9)) * 0.1 * decay;

          // Sticks chatter against each other inside the cup.
          sticks.forEach((s, i) => {
            const wobble = Math.sin(k * Math.PI * 11 + i * 1.7) * 0.05 * decay;
            const axis = new THREE.Vector3(Math.sin(i * 2.1), 0, -Math.cos(i * 2.1));
            s.group.quaternion
              .copy(s.homeQ)
              .multiply(new THREE.Quaternion().setFromAxisAngle(axis, wobble));
            s.group.position.y = FLOOR + Math.abs(Math.sin(k * Math.PI * 13 + i)) * 0.07 * decay;
          });

          if (now >= nextRattle) {
            cb.current.onRattle?.(decay);
            nextRattle = now + 95 + Math.abs(swing) * 220;
          }
        } else {
          // Cup settles; the winning stick climbs out and squares up.
          const k = easeOutCubic((u - SHAKE) / (1 - SHAKE));
          cup.rotation.z *= 0.82;
          cup.rotation.x *= 0.82;
          cup.position.y *= 0.82;

          if (nextRattle !== -1) {
            cb.current.onDraw?.();
            nextRattle = -1;
          }

          const s = sticks[chosen];
          s.group.position.lerpVectors(s.home, outPos, easeInOut(k));
          s.group.quaternion.slerpQuaternions(s.homeQ, outQ, k);

          // The rest sink back into a tidy bundle.
          sticks.forEach((o, i) => {
            if (i === chosen) return;
            o.group.position.y += (FLOOR - o.group.position.y) * 0.18;
            o.group.quaternion.slerp(o.homeQ, 0.18);
          });
        }

        if (u >= 1) {
          drawing = false;
          cup.rotation.set(0, 0, 0);
          cup.position.y = 0;
          resolveDraw?.();
          resolveDraw = null;
        }
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    /* -------------------------------------------------------------- sizing */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameCamera(
        camera,
        {
          min: new THREE.Vector3(-2.8, -0.3, -2.8),
          max: new THREE.Vector3(2.8, FLOOR + STICK_LEN + RISE + 0.5, 2.8),
        },
        { tilt: CAM_TILT, width: w, height: h, margin: 1.05 },
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      trash.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    draw: (index: number) => api.current?.draw(index) ?? Promise.resolve(),
  }));

  return <div ref={mountRef} className={className} />;
});
