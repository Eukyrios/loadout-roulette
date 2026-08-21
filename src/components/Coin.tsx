import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../engine/sound';

/** Token diameter in px. Must match .coin in index.css. */
const COIN_PX = 58;
/** How far below the top edge the pointer holds it — the pendulum pivot. */
const TOP_GRAB = 7;

interface Props {
  /** The coin slot to drop onto. */
  targetRef: React.RefObject<HTMLElement | null>;
  onInsert: () => void;
  /** Shown on the coin face. */
  label?: string;
  /**
   * Difficulty the token was minted at — 'red' | 'black' | 'green'. Drives the
   * metal: bronze for Easy, steel for Normal, gold for Hard.
   */
  tone?: string;
}

/**
 * A token the player drags from the dispenser tray into the machine's coin
 * slot. Pointer events rather than HTML5 drag-and-drop, so it works on touch.
 *
 * Dragging is the fun path, not the only path: clicking the coin or pressing
 * Enter on it inserts too, because a drag-only control is unusable by
 * keyboard and awkward on a phone.
 */
export function Coin({ targetRef, onInsert, label = 'DF', tone = 'black' }: Props) {
  const coinRef = useRef<HTMLButtonElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [over, setOver] = useState(false);
  const [gone, setGone] = useState(false);
  const grabOffset = useRef({ x: 0, y: 0 });
  // Distinguishes a click from a drag-and-release.
  const moved = useRef(false);
  /** Drag sway: current tilt in degrees, plus the velocity driving it. */
  const [sway, setSway] = useState(0);
  const tilt = useRef(0);
  const vel = useRef(0);
  const lastX = useRef(0);
  const shown = useRef(0);
  /** Sparks thrown off when the token strikes the edge of the screen. */
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; dx: number; dy: number }[]>([]);
  const sparkId = useRef(0);
  /** Which edges it is currently pinned against, so one hit is one clank. */
  const onEdge = useRef({ x: false, y: false });
  const lastWhoosh = useRef(0);

  const hitTest = useCallback(
    (x: number, y: number) => {
      const el = targetRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const pad = 44; // generous, so the drop doesn't feel fiddly
      return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
    },
    [targetRef],
  );

  /** Sound and sparks for a strike against the edge of the screen. */
  const burst = useCallback((x: number, y: number, nx: number, ny: number, speed: number) => {
    sfx.coinClank(Math.min(1, speed / 40));
    const made = Array.from({ length: 7 }, () => {
      // Fan them off along the surface normal, so they spray away from the
      // wall rather than through it.
      const spread = (Math.random() - 0.5) * 1.7;
      const ax = nx * Math.cos(spread) - ny * Math.sin(spread);
      const ay = nx * Math.sin(spread) + ny * Math.cos(spread);
      const power = 26 + Math.random() * 46;
      return { id: sparkId.current++, x, y, dx: ax * power, dy: ay * power + 14 };
    });
    setSparks((prev) => [...prev, ...made]);
    const ids = new Set(made.map((m) => m.id));
    window.setTimeout(() => setSparks((prev) => prev.filter((s2) => !ids.has(s2.id))), 560);
  }, []);

  const insert = useCallback(() => {
    if (gone) return;
    setGone(true);
    setDrag(null);
    // Let the drop animation play before the machine reacts.
    window.setTimeout(onInsert, 420);
  }, [gone, onInsert]);

  const isDragging = drag !== null;

  useEffect(() => {
    if (!isDragging) return;

    const move = (e: PointerEvent) => {
      moved.current = true;
      const raw = { x: e.clientX - grabOffset.current.x, y: e.clientY - grabOffset.current.y };

      // Keep the token on screen. Clamping is also how an edge strike is
      // detected: if the pointer wants to go further than the coin can, it has
      // hit something.
      const maxX = window.innerWidth - COIN_PX;
      const maxY = window.innerHeight - COIN_PX;
      const x = Math.max(0, Math.min(maxX, raw.x));
      const y = Math.max(0, Math.min(maxY, raw.y));

      const hitX = raw.x < 0 || raw.x > maxX;
      const hitY = raw.y < 0 || raw.y > maxY;
      const speed = Math.abs(vel.current);

      // Latched per axis: while it stays jammed against a wall it should not
      // machine-gun clanks, only fire again once it has come away.
      if (hitX && !onEdge.current.x) {
        burst(x + COIN_PX / 2, y + COIN_PX / 2, raw.x < 0 ? 1 : -1, 0, speed);
      }
      if (hitY && !onEdge.current.y) {
        burst(x + COIN_PX / 2, y + COIN_PX / 2, 0, raw.y < 0 ? 1 : -1, speed);
      }
      onEdge.current = { x: hitX, y: hitY };

      // Horizontal speed drives the sway. Blended rather than replaced so a
      // single jittery sample cannot snap the coin sideways.
      vel.current = vel.current * 0.6 + (x - lastX.current) * 0.4;
      lastX.current = x;

      // Whistle when it is genuinely being thrown about, throttled so a fast
      // drag is a sound rather than a swarm of them.
      const now = performance.now();
      if (Math.abs(vel.current) > 18 && now - lastWhoosh.current > 110) {
        lastWhoosh.current = now;
        sfx.coinWhoosh(Math.min(1, Math.abs(vel.current) / 60));
      }

      setDrag({ x, y });
      setOver(hitTest(e.clientX, e.clientY));
    };

    const up = (e: PointerEvent) => {
      const hit = hitTest(e.clientX, e.clientY);
      setOver(false);
      if (hit) insert();
      else if (!moved.current) insert(); // treated as a click
      else setDrag(null); // snap home
    };

    /**
     * The coin lags and swings as you wave it about, rather than staying rigid.
     *
     * Driven by a frame loop instead of set straight from the pointer, because
     * the two halves need different timing: the tilt chases the current speed,
     * while the speed itself bleeds away. Hold the coin still mid-drag and it
     * settles upright on its own; whip it sideways and it swings behind the
     * cursor and overshoots back.
     */
    let raf = 0;
    const spring = () => {
      raf = requestAnimationFrame(spring);
      const target = Math.max(-24, Math.min(24, vel.current * 1.4));
      tilt.current += (target - tilt.current) * 0.22;
      vel.current *= 0.82; // no pointer movement, no drive — so it recentres
      // Compared against what was last rendered, not against a captured
      // `sway` — reading state here would pin the loop to a stale frame.
      if (Math.abs(tilt.current - shown.current) > 0.15) {
        shown.current = tilt.current;
        setSway(tilt.current);
      }
    };
    raf = requestAnimationFrame(spring);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [isDragging, burst, hitTest, insert]);

  if (gone) return <div className="coin coin--spent" aria-hidden="true" />;

  const style: React.CSSProperties = drag
    ? {
        position: 'fixed',
        left: drag.x,
        top: drag.y,
        margin: 0,
        zIndex: 60,
        cursor: 'grabbing',
        // Restates the scale from .coin.is-dragging: an inline transform
        // replaces the stylesheet's outright rather than adding to it.
        transform: `scale(1.1) rotate(${sway.toFixed(2)}deg)`,
      }
    : {};

  return (
    <>
      {/* Sparks live outside the button: it is the thing being flung about, and
          they need to stay where the impact happened. */}
      {sparks.length > 0 && (
        <div className={`sparks coin--${tone}`} aria-hidden="true">
          {sparks.map((s) => (
            <span
              key={s.id}
              className="spark"
              style={
                {
                  left: s.x,
                  top: s.y,
                  '--dx': `${s.dx}px`,
                  '--dy': `${s.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    <button
      ref={coinRef}
      type="button"
      className={`coin coin--${tone}${drag ? ' is-dragging' : ''}${over ? ' is-over' : ''}`}
      style={style}
      aria-label={`${label} token — drag it into the coin slot, or press Enter to insert`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          insert();
        }
      }}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        // Always taken by the top edge rather than wherever it was pressed, so
        // it hangs from the pointer. That is also the pivot the sway rotates
        // about — grabbing it mid-face would have it swinging around its
        // middle, which reads as spinning rather than dangling.
        grabOffset.current = { x: r.width / 2, y: TOP_GRAB };
        moved.current = false;
        lastX.current = r.left;
        vel.current = 0;
        tilt.current = 0;
        setSway(0);
        // Keeps the drag alive if the finger slides off the coin.
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setDrag({ x: r.left, y: r.top });
      }}
    >
      <span className="coin__face">
        <span className="coin__label">{label}</span>
      </span>
    </button>
    </>
  );
}
