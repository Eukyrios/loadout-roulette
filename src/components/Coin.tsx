import { useCallback, useEffect, useRef, useState } from 'react';

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

  const insert = useCallback(() => {
    if (gone) return;
    setGone(true);
    setDrag(null);
    // Let the drop animation play before the machine reacts.
    window.setTimeout(onInsert, 420);
  }, [gone, onInsert]);

  useEffect(() => {
    if (!drag) return;

    const move = (e: PointerEvent) => {
      moved.current = true;
      const x = e.clientX - grabOffset.current.x;
      const y = e.clientY - grabOffset.current.y;
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

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [drag, hitTest, insert]);

  if (gone) return <div className="coin coin--spent" aria-hidden="true" />;

  const style: React.CSSProperties = drag
    ? { position: 'fixed', left: drag.x, top: drag.y, margin: 0, zIndex: 60, cursor: 'grabbing' }
    : {};

  return (
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
        grabOffset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        moved.current = false;
        setDrag({ x: r.left, y: r.top });
      }}
    >
      <span className="coin__face">
        <span className="coin__label">{label}</span>
      </span>
    </button>
  );
}
