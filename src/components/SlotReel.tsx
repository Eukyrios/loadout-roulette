import { useEffect, useMemo, useRef, useState } from 'react';
import type { Entry, SlotSpec } from '../data/types';

/** Cell height in px. Must match `--cell` in index.css. */
export const CELL = 76;

/** How many filler cells whip past before the winner shows up. */
const FILLERS = 22;

interface Props {
  slot: SlotSpec;
  entry: Entry | null;
  pool: Entry[];
  held: boolean;
  spinning: boolean;
  /** Spin length in ms. Staggering this across reels is what makes them
   *  settle one after another. */
  duration: number;
  instant: boolean;
  locked: boolean;
  onHold: () => void;
  onSpin: () => void;
  onNudge: (dir: -1 | 1) => void;
  onSpinEnd: () => void;
  /** Fired repeatedly while the strip is moving, for the ratchet sound. */
  onTick?: () => void;
}

const rand = <T,>(list: T[]): T | undefined => list[Math.floor(Math.random() * list.length)];

export function SlotReel({
  slot,
  entry,
  pool,
  held,
  spinning,
  duration,
  instant,
  locked,
  onHold,
  onSpin,
  onNudge,
  onSpinEnd,
  onTick,
}: Props) {
  // The strip is the column of cells we slide behind the window. Index 1 is
  // the payline at rest, so a static strip is [above, current, below].
  const [strip, setStrip] = useState<(Entry | null)[]>([null, entry, null]);
  const [offset, setOffset] = useState(0);
  const [moving, setMoving] = useState(false);
  const [blur, setBlur] = useState(false);
  const [flash, setFlash] = useState(false);

  const cb = useRef({ onSpinEnd, onTick });
  cb.current = { onSpinEnd, onTick };
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const empty = pool.length === 0;
  const entryId = entry?.id ?? null;

  /* -- static rest state ------------------------------------------------- */
  useEffect(() => {
    if (spinning) return;
    setStrip([rand(pool) ?? null, entry, rand(pool) ?? null]);
    setOffset(0);
    setMoving(false);
    setBlur(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, spinning]);

  /* -- the spin ---------------------------------------------------------- */
  useEffect(() => {
    if (!spinning) return;
    clearTimers();

    if (instant || empty) {
      cb.current.onSpinEnd();
      return;
    }

    const prev = strip[1] ?? entry;
    const fill = Array.from({ length: FILLERS }, () => rand(pool) ?? null);
    const tail = [rand(pool) ?? null, rand(pool) ?? null];
    const next = [rand(pool) ?? null, prev, ...fill, entry, ...tail];
    const targetIndex = 2 + FILLERS;

    setStrip(next);
    setOffset(0);
    setMoving(false);
    setBlur(true);

    // Two frames: one to paint the reset strip, one to start the transition
    // from it. Without the double rAF the browser coalesces both and the reel
    // jumps straight to the answer.
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        setMoving(true);
        setOffset(-(targetIndex - 1) * CELL);
      });
      timers.current.push(r2 as unknown as number);
    });
    timers.current.push(r1 as unknown as number);

    // Ratchet clicks, one per cell boundary. The strip decelerates, so the
    // clicks have to as well: invert the easing to find when each cell passes.
    if (cb.current.onTick) {
      const cells = targetIndex - 1;
      for (let k = 1; k <= cells; k++) {
        const progress = k / cells;
        const u = 1 - Math.cbrt(1 - progress); // inverse of easeOutCubic
        timers.current.push(window.setTimeout(() => cb.current.onTick?.(), u * duration));
      }
    }

    // Sharpen just before it lands so the winner is legible on arrival.
    timers.current.push(window.setTimeout(() => setBlur(false), Math.max(0, duration - 420)));
    timers.current.push(
      window.setTimeout(() => {
        setMoving(false);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 520);
        cb.current.onSpinEnd();
      }, duration),
    );

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  const stripStyle = useMemo(
    () => ({
      transform: `translate3d(0, ${offset}px, 0)`,
      transition: moving ? `transform ${duration}ms cubic-bezier(.16,.62,.16,1)` : 'none',
    }),
    [offset, moving, duration],
  );

  return (
    <div
      className={`reel${held ? ' is-held' : ''}${spinning ? ' is-spinning' : ''}${
        empty ? ' is-empty' : ''
      }${flash ? ' is-flash' : ''}`}
    >
      <div className="reel__head">
        <span className="reel__label">{slot.label}</span>
        <span className="reel__count">{empty ? '0' : pool.length}</span>
      </div>

      <div className="reel__window">
        <div className={`reel__strip${blur ? ' is-blur' : ''}`} style={stripStyle}>
          {strip.map((item, i) => (
            <div className="cell" key={`${item?.id ?? 'x'}-${i}`}>
              {empty ? (
                <span className="cell__name cell__name--empty">No match</span>
              ) : (
                <>
                  <span className="cell__name">{item?.name ?? '—'}</span>
                  {item?.note && <span className="cell__note">{item.note}</span>}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="reel__shade" aria-hidden="true" />
      </div>

      <p className="reel__value" aria-live="polite">
        {empty ? 'Filters exclude everything' : (entry?.name ?? '—')}
      </p>

      <div className="reel__controls">
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => onNudge(-1)}
          disabled={empty || spinning || locked}
          aria-label={`Previous ${slot.label}`}
        >
          ▲
        </button>
        <button
          type="button"
          className={`btn btn--hold${held ? ' is-on' : ''}`}
          onClick={onHold}
          disabled={empty || locked}
          aria-pressed={held}
        >
          {held ? 'Held' : 'Hold'}
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => onNudge(1)}
          disabled={empty || spinning || locked}
          aria-label={`Next ${slot.label}`}
        >
          ▼
        </button>
      </div>

      <button
        type="button"
        className="reel__respin"
        onClick={onSpin}
        disabled={empty || spinning || locked}
      >
        Re-spin
      </button>

      {slot.hint && <p className="reel__hint">{slot.hint}</p>}
    </div>
  );
}
