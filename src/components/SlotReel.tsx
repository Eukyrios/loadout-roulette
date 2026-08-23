import { useEffect, useMemo, useRef, useState } from 'react';
import { entryImageSrc } from '../data/icons';
import { getSettings } from '../engine/settings';
import type { Entry, SlotSpec } from '../data/types';

/** Cell height in px. Must match `--cell` in index.css. */
export const CELL = 76;

/**
 * How many filler cells whip past before the winner shows up.
 *
 * Derived from the spin length rather than fixed. With a constant count, a
 * longer spin covers the SAME distance over more time — the reel just crawls,
 * which reads as sluggish rather than as a longer spin, and makes the rarity
 * stretch almost invisible. Scaling the count keeps the strip's speed roughly
 * constant, so extra time becomes extra travel: visibly more items flying past.
 *
 * The divisor is set so a base-length spin still yields the 22 cells this used
 * to hardcode.
 */
const fillersFor = (duration: number) =>
  Math.max(10, Math.min(96, Math.round(duration / 68)));
/** How long a single-step nudge takes to slide one cell. */
const NUDGE_MS = 190;

interface Props {
  slot: SlotSpec;
  entry: Entry | null;
  pool: Entry[];
  held: boolean;
  spinning: boolean;
  /** Spin length in ms. Staggering this across reels is what makes them
   *  settle one after another. */
  duration: number;
  onHold: () => void;
  onSpin: () => void;
  /** A token is loaded, so a single column may be re-rolled. */
  canSpin: boolean;
  onNudge: (dir: -1 | 1) => void;
  onSpinEnd: () => void;
  /** Fired repeatedly while the strip is moving, for the ratchet sound. */
  onTick?: () => void;
  /**
   * The tier bounds for this column, rendered under it.
   *
   * These used to live in the settings panel, a long way from the reel they
   * govern. Above the column they read as a constraint on what is about to
   * come down it, rather than as a footnote under the result. Columns with no
   * tier filter — map, operator, weapon — pass nothing and get nothing, and
   * an empty box holds their heading in line with the rest.
   */
  range?: React.ReactNode;
}

const rand = <T,>(list: T[]): T | undefined => list[Math.floor(Math.random() * list.length)];

/**
 * Entries whose picture would not load, so the cell can fall back to the name.
 *
 * This is not defensive padding. The pictures are local files that a build step
 * has to put in public/gear/, and a build made before that step has run says
 * every entry has one when none of them do. Hiding the broken image left the
 * cell completely blank — worse than the text it replaced — so a miss has to
 * put the name back rather than just get out of the way.
 *
 * Module-level and shared by every column: the same item can be in more than
 * one strip, and a file that 404'd once will 404 again. Subscribers are woken
 * once per newly-failed id, not once per failed <img>.
 */
const MISSING = new Set<string>();
const watchers = new Set<() => void>();
function missed(id: string) {
  if (MISSING.has(id)) return;
  MISSING.add(id);
  watchers.forEach((w) => w());
}

/** Checked per nudge rather than cached, so toggling the OS setting takes
 *  effect without a reload. */
const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The two cells either side of the payline, at rest.
 *
 * These are the pool entries ADJACENT to the current one, not random picks.
 * Two reasons, and the first is a bug the second would have hidden:
 *
 *  1. A random neighbour can land on the item already on the payline, so the
 *     same name shows up twice in the window.
 *  2. The nudge arrows step through the pool in order, so the cell below the
 *     payline must be the one that arrives when you press it. Random
 *     neighbours make the reel lie about what is coming next.
 */
function neighbours(pool: Entry[], entry: Entry | null): [Entry | null, Entry | null] {
  const n = pool.length;
  // Nothing to show either side of a pool that is only the current item.
  if (n < 2) return [null, null];
  const i = entry ? pool.findIndex((e) => e.id === entry.id) : -1;
  // Current entry isn't in the pool (a stale roll): wrap the ends instead.
  if (i < 0) return [pool[n - 1] ?? null, pool[0] ?? null];
  return [pool[(i - 1 + n) % n], pool[(i + 1) % n]];
}

export function SlotReel({
  slot,
  entry,
  pool,
  held,
  spinning,
  duration,
  onHold,
  onSpin,
  canSpin,
  onNudge,
  onSpinEnd,
  onTick,
  range,
}: Props) {
  // The strip is the column of cells we slide behind the window. Index 1 is
  // the payline at rest, so a static strip is [above, current, below].
  const [strip, setStrip] = useState<(Entry | null)[]>([null, entry, null]);
  const [offset, setOffset] = useState(0);
  const [moving, setMoving] = useState(false);
  const [moveMs, setMoveMs] = useState(0);
  const [blur, setBlur] = useState(false);
  const [flash, setFlash] = useState(false);
  /** Tier of whatever is crossing the payline mid-spin. See the spin effect. */
  const [liveTier, setLiveTier] = useState(0);

  // Re-render this column when any picture anywhere turns out to be missing.
  const [, bump] = useState(0);
  useEffect(() => {
    const w = () => bump((n) => n + 1);
    watchers.add(w);
    return () => {
      watchers.delete(w);
    };
  }, []);

  /** The sliding column. Needed so a nudge can settle on its transitionend. */
  const stripRef = useRef<HTMLDivElement>(null);

  const cb = useRef({ onSpinEnd, onTick });
  cb.current = { onSpinEnd, onTick };
  const timers = useRef<number[]>([]);
  // Kept apart from the timeouts: these need cancelAnimationFrame, and the two
  // id spaces are unrelated.
  const rafs = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    rafs.current.forEach(cancelAnimationFrame);
    rafs.current = [];
  };

  /**
   * Paint the start position, THEN transition from it. Without waiting two
   * frames the browser coalesces both into one style change and the strip
   * jumps straight to the end instead of sliding.
   */
  const afterPaint = (fn: () => void) => {
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(fn);
      rafs.current.push(r2);
    });
    rafs.current.push(r1);
  };

  const empty = pool.length === 0;
  const entryId = entry?.id ?? null;
  // Gear tier of the current item, if this slot has one at all. Map, operator
  // and weapon carry no tier and stay neutral.
  //
  // Withheld while the reel is spinning: `entry` is decided the moment the
  // lever is pulled, so colouring the column from it straight away would
  // announce the rarity before the reel had landed — the one thing the spin
  // exists to keep you waiting for.
  const tier = spinning ? liveTier : Number(entry?.attrs?.tier ?? 0);

  /* -- static rest state ------------------------------------------------- */
  const [above, below] = neighbours(pool, entry);
  // Keyed on the neighbours themselves, not just the entry: changing a filter
  // can reshape the pool around an unchanged payline item, and the cells either
  // side have to follow it.
  const restKey = `${above?.id ?? ''}|${entryId ?? ''}|${below?.id ?? ''}`;

  /**
   * Tracks what was on the payline last, so a change of one step through the
   * pool can be told apart from a jump. The nudge direction is derived here
   * rather than passed in as a prop: any single-step change should slide,
   * whoever caused it.
   */
  const prevId = useRef<string | null>(entryId);

  useEffect(() => {
    // Keep the tracker current during a spin, so the landing isn't mistaken
    // for a nudge when the reel happens to stop on an adjacent item.
    if (spinning) {
      prevId.current = entryId;
      return;
    }

    const fromId = prevId.current;
    prevId.current = entryId;
    setBlur(false);

    const n = pool.length;
    const from = fromId ? pool.findIndex((e) => e.id === fromId) : -1;
    const to = entry ? pool.findIndex((e) => e.id === entry.id) : -1;

    // Did we move exactly one place through the pool?
    let dir = 0;
    if (n > 2 && from >= 0 && to >= 0 && from !== to && !reducedMotion()) {
      if ((from + 1) % n === to) dir = 1;
      else if ((from - 1 + n) % n === to) dir = -1;
    }

    if (dir === 0) {
      setStrip([above, entry, below]);
      setOffset(0);
      setMoving(false);
      return;
    }

    // Slide one cell. The strip is built with FOUR cells spanning both the old
    // and new positions, started on the old one, then transitioned — so the
    // column visibly travels instead of the middle cell swapping its contents.
    clearTimers();
    const fromEntry = pool[from];
    if (dir === 1) {
      setStrip([pool[(from - 1 + n) % n], fromEntry, entry, below]);
      setOffset(0); // payline = index 1 = where we were
    } else {
      setStrip([above, entry, fromEntry, pool[(from + 1) % n]]);
      setOffset(-CELL); // payline = index 2 = where we were
    }
    setMoving(false);
    setMoveMs(NUDGE_MS);

    /**
     * Collapse back to the canonical [above, entry, below] at offset 0 once the
     * slide lands. Visually identical — the payline holds the same item — but
     * it leaves every reel in one predictable resting shape rather than a
     * four-cell strip parked at an offset.
     */
    const settle = () => {
      setMoving(false);
      setStrip([above, entry, below]);
      setOffset(0);
    };

    afterPaint(() => {
      setMoving(true);
      setOffset(dir === 1 ? -CELL : 0);

      // Settle on the transition ACTUALLY ending, not on a wall-clock timer.
      // A timer starts counting here, but the transition does not begin until
      // the next style recalculation — and on a slow machine that gap is tens
      // of milliseconds. A NUDGE_MS-length timer then fires mid-slide and
      // truncates it, which is both visibly wrong and reports as a cancelled
      // transition rather than a finished one.
      const el = stripRef.current;
      if (!el) {
        timers.current.push(window.setTimeout(settle, NUDGE_MS + 30));
        return;
      }
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', onEnd);
        settle();
      };
      el.addEventListener('transitionend', onEnd);
      // Belt and braces: if the browser drops the event entirely (a background
      // tab, a coalesced frame), settle anyway — but late enough that it can
      // never cut a running slide short.
      timers.current.push(
        window.setTimeout(() => {
          el.removeEventListener('transitionend', onEnd);
          settle();
        }, NUDGE_MS + 400),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restKey, spinning]);

  /* -- the spin ---------------------------------------------------------- */
  useEffect(() => {
    if (!spinning) return;
    clearTimers();

    if (empty) {
      cb.current.onSpinEnd();
      return;
    }

    /*
     * Animation off: put the answer up and hand straight on.
     *
     * Not a shortened spin. The strip's landing is driven by a CSS transition
     * with a timed backstop behind it, and the backstop is deliberately
     * generous — a transition that has not started yet must never be cut
     * short. Shrinking the duration therefore does not make a pull quick; the
     * backstop still governs, and seven columns of it add up to a wait. With
     * animation off there is no transition to wait for, so there is nothing to
     * shadow: show the result and end the spin on the next frame.
     */
    if (!getSettings().animate) {
      setStrip([null, entry, null]);
      setMoving(false);
      setBlur(false);
      setOffset(0);
      const id = window.requestAnimationFrame(() => {
        setFlash(true);
        timers.current.push(window.setTimeout(() => setFlash(false), 260));
        cb.current.onSpinEnd();
      });
      return () => window.cancelAnimationFrame(id);
    }

    const prev = strip[1] ?? entry;
    const fillers = fillersFor(duration);
    /*
     * The three cells the reel STOPS on are the real ones, not fillers.
     *
     * The winner used to arrive between two random picks, and the moment the
     * spin ended those two were swapped for the pool's actual neighbours — so
     * the column visibly reshuffled itself a beat after landing, which read as
     * the machine changing its mind. Seating `above` and `below` around the
     * winner while the strip is built means what flies into place is what
     * stays, and the nudge arrows still step to the item shown, because those
     * ARE the pool neighbours.
     */
    const fill = Array.from({ length: Math.max(0, fillers - 1) }, () => rand(pool) ?? null);
    const next = [rand(pool) ?? null, prev, ...fill, above, entry, below, rand(pool) ?? null];
    const targetIndex = 3 + fill.length;

    setStrip(next);
    setOffset(0);
    setMoving(false);
    setMoveMs(duration);
    setBlur(true);

    afterPaint(() => {
      setMoving(true);
      setOffset(-(targetIndex - 1) * CELL);
    });

    /*
     * Colour the bay from whatever is crossing the payline right now.
     *
     * The tier used to be withheld for the whole spin so the reveal was not
     * given away early. Holding it neutral also made the column look inert
     * while a hundred items flew past it. Reading the strip's live position
     * instead gives the bay the colour of the item actually in the window, so
     * it flickers through the grades and settles on the winner's — and it
     * still gives nothing away, because until it stops, the colour showing is
     * some other item's.
     *
     * The position has to be read back off the element: the travel is a CSS
     * transition, so React never sees the intermediate offsets.
     */
    let liveRaf = 0;
    let lastIdx = -1;
    let sampling = true;
    const sampleTier = () => {
      const el = stripRef.current;
      if (el) {
        const t = getComputedStyle(el).transform;
        // "none" before the transition starts; a matrix once it is running.
        const y = t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0;
        const idx = Math.round(-y / CELL) + 1;
        if (idx !== lastIdx) {
          lastIdx = idx;
          setLiveTier(Number(next[idx]?.attrs?.tier ?? 0));
        }
      }
      liveRaf = sampling ? requestAnimationFrame(sampleTier) : 0;
    };
    liveRaf = requestAnimationFrame(sampleTier);

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

    /**
     * Finish the spin. Fired by the transition ACTUALLY ending rather than a
     * timer set to the same length.
     *
     * The two are not equivalent: a timer at `duration` and the transition it
     * is shadowing finish in a photo finish, and if the timer wins it sets
     * `transition: none` on a still-running animation — cancelling it and
     * clipping the last of the reel's easing. The transition also starts a
     * frame or two after the timer begins counting, so on a slow machine the
     * timer wins reliably.
     */
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      sampling = false;
      cancelAnimationFrame(liveRaf);
      setMoving(false);
      setFlash(true);
      timers.current.push(window.setTimeout(() => setFlash(false), 520));
      cb.current.onSpinEnd();
    };

    const el = stripRef.current;

    /**
     * The fallback is armed from when the transition ACTUALLY STARTS, not from
     * here.
     *
     * A transition begins a frame or two after the style is applied, and on a
     * loaded machine that gap runs to hundreds of milliseconds. A fallback
     * measured from this point would then fire while the spin was still
     * running, set `transition: none`, and cancel it — clipping the reel and
     * losing the transitionend the queue waits on. Re-arming on transitionstart
     * makes the margin relative to the animation rather than to a guess.
     *
     * The initial, much longer arming is the backstop for a transition that
     * never starts at all: better a late reel than a queue that stalls.
     */
    let fallback = 0;
    const arm = (ms: number) => {
      clearTimeout(fallback);
      fallback = window.setTimeout(land, ms);
      timers.current.push(fallback);
    };
    const onStart = (e: TransitionEvent) => {
      if (e.propertyName === 'transform') arm(duration + 250);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform') return;
      land();
    };
    if (el) {
      el.addEventListener('transitionstart', onStart);
      el.addEventListener('transitionend', onEnd);
      arm(duration + 2500);
    } else {
      arm(duration);
    }

    return () => {
      sampling = false;
      cancelAnimationFrame(liveRaf);
      el?.removeEventListener('transitionstart', onStart);
      el?.removeEventListener('transitionend', onEnd);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  const stripStyle = useMemo(
    () => ({
      transform: `translate3d(0, ${offset}px, 0)`,
      transition: moving ? `transform ${moveMs}ms cubic-bezier(.16,.62,.16,1)` : 'none',
    }),
    [offset, moving, moveMs],
  );

  return (
    <div
      className={`reel${held ? ' is-held' : ''}${spinning ? ' is-spinning' : ''}${
        empty ? ' is-empty' : ''
      }${flash ? ' is-flash' : ''}${tier ? ` reel--t${tier}` : ''}`}
    >
      {range}

      <div className="reel__head">
        <span className="reel__label">{slot.label}</span>
        <span className="reel__count">{empty ? '0' : pool.length}</span>
      </div>

      <div className="reel__window">
        <div
          ref={stripRef}
          className={`reel__strip${blur ? ' is-blur' : ''}`}
          style={stripStyle}
        >
          {strip.map((item, i) => {
            const icon = empty || (item && MISSING.has(item.id)) ? null : entryImageSrc(item?.id);
            return (
            <div
              className={`cell${icon ? ' cell--art' : ''}`}
              key={`${item?.id ?? 'x'}-${i}`}
            >
              {empty ? (
                <span className="cell__name cell__name--empty">No match</span>
              ) : icon ? (
                /* Picture only. The strip is a blur of things going past, not
                   something you read — the name that matters is the one under
                   the window, which is the item that actually landed. A name
                   in every cell competed with it and made a spin look like a
                   list scrolling. */
                <img
                  className="cell__icon"
                  src={icon}
                  /* Decorative. The name is announced by .reel__value, which
                     is the live region, so repeating it here would read the
                     whole strip out twice. */
                  alt=""
                  /* Not lazy. A strip holds three cells at rest and the whole
                     machine about twenty — small enough to just fetch, and
                     deferring them means the winner of a spin arrives after
                     the reel has stopped on it. */
                  decoding="async"
                  onError={() => item && missed(item.id)}
                />
              ) : (
                /* No picture published for this one — maps, operators and the
                   newer guns. A blank cell would read as a broken strip, so
                   these keep the name they always had. */
                <span className="cell__text">
                  <span className="cell__name">{item?.name ?? '—'}</span>
                  {item?.note && <span className="cell__note">{item.note}</span>}
                </span>
              )}
            </div>
            );
          })}
        </div>
        <div className="reel__shade" aria-hidden="true" />
        {/* The cabinet's own payline is one bar drawn across all seven columns,
            which works on desktop but scrolls away with the strip on a phone —
            where the columns are one per screen, only the first one ever had
            it. Each column carries its own, shown at that width instead. */}
        <div className="reel__payline" aria-hidden="true">
          <span className="payline__arrow payline__arrow--l">▶</span>
          <span className="payline__arrow payline__arrow--r">◀</span>
        </div>
      </div>

      <p className="reel__value" aria-live="polite">
        {empty ? 'Filters exclude everything' : (entry?.name ?? '—')}
      </p>

      <div className="reel__controls">
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => onNudge(-1)}
          disabled={empty || spinning}
          aria-label={`Previous ${slot.label}`}
        >
          ▲
        </button>
        <button
          type="button"
          className={`btn btn--hold${held ? ' is-on' : ''}`}
          onClick={onHold}
          disabled={empty}
          aria-pressed={held}
        >
          {held ? 'Held' : 'Hold'}
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => onNudge(1)}
          disabled={empty || spinning}
          aria-label={`Next ${slot.label}`}
        >
          ▼
        </button>
      </div>

      <button
        type="button"
        className="reel__respin"
        onClick={onSpin}
        disabled={empty || spinning || !canSpin}
        title={canSpin ? 'Spend a token to re-roll this column' : 'Needs a token'}
      >
        Spin
      </button>

      {slot.hint && <p className="reel__hint">{slot.hint}</p>}
    </div>
  );
}
