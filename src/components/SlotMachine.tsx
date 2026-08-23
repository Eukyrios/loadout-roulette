import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { DependencyChip, type DependencyOption } from './DependencyChip';
import { SlotReel } from './SlotReel';
import { SLOTS } from '../data/slots';
import type { Entry, Roll } from '../data/types';

/** How far the knob travels, in px, and how far you must pull to commit. */
const LEVER_TRAVEL = 78;
const LEVER_COMMIT = 0.55;

interface Props {
  rolls: Record<string, Roll>;
  pools: Record<string, Entry[]>;
  spinning: Record<string, boolean>;
  durations: Record<string, number>;
  /** Unspent tokens. Gates the lever only — the per-reel controls are
   *  always live. */
  credits: number;
  /** Difficulty of the token currently in the machine. */
  creditMode: Entry | null;
  /** Name of the preset the current filters match, or 'Custom'. */
  preset: string;
  onHold: (slotId: string) => void;
  onSpin: (slotId: string) => void;
  onNudge: (slotId: string, dir: -1 | 1) => void;
  onSpinEnd: (slotId: string) => void;
  onTick: () => void;
  onPull: () => void;
  anySpinning: boolean;
  /** Difficulties that can be set by hand from the crown readout. */
  modeOptions: DependencyOption[];
  onPickMode: (id: string) => void;
  /** Presets, likewise — same control, same place. */
  presetOptions: DependencyOption[];
  onPickPreset: (id: string) => void;
  /** The tier bounds for a column, rendered under it. */
  rangeFor: (slotId: string) => React.ReactNode;
  /**
   * The settings panel, mounted inside the cabinet.
   *
   * Passed in rather than built here because the filter state belongs to the
   * page; the machine only decides where it sits. And it sits in the machine
   * because every filter left in it narrows these reels and nothing else.
   */
  settings?: React.ReactNode;
}

/**
 * The cabinet. `ref` points at the coin slot so the Coin component knows where
 * the drop target is.
 */
export const SlotMachine = forwardRef<HTMLDivElement, Props>(function SlotMachine(
  {
    rolls,
    pools,
    spinning,
    durations,
    credits,
    creditMode,
    preset,
    onHold,
    onSpin,
    onNudge,
    onSpinEnd,
    onTick,
    onPull,
    anySpinning,
    modeOptions,
    onPickMode,
    presetOptions,
    onPickPreset,
    rangeFor,
    settings,
  },
  coinSlotRef,
) {
  const disabled = credits === 0 || anySpinning;

  /**
   * Keep the column that is currently spinning in view.
   *
   * On a phone the reels are one-per-screen and snap, so without this a pull
   * would spend most of its time animating columns you cannot see. Because the
   * reels run strictly in order, following the active one walks the whole set
   * for you.
   *
   * Scrolls the strip directly rather than using scrollIntoView, which would
   * also scroll the PAGE to bring the cabinet into view and yank the viewport
   * around mid-spin. On desktop nothing overflows, so this is a no-op.
   */
  const cabinetRef = useRef<HTMLDivElement>(null);
  const activeSlot = SLOTS.findIndex((s) => spinning[s.id]);
  const prevActive = useRef(-1);
  const scrollAnim = useRef({ raf: 0, timer: 0 });

  useEffect(() => {
    const cab = cabinetRef.current;
    if (activeSlot < 0) {
      prevActive.current = -1;
      return;
    }
    const reel = cab?.querySelectorAll<HTMLElement>('.reel')[activeSlot];
    if (!cab || !reel) return;
    if (cab.scrollWidth <= cab.clientWidth) return; // desktop: nothing to scroll

    const from = cab.scrollLeft;
    const target = reel.offsetLeft - (cab.clientWidth - reel.clientWidth) / 2;
    const wasFirst = prevActive.current < 0;
    prevActive.current = activeSlot;
    if (Math.abs(target - from) < 2) return;

    /**
     * Wait on the column that just landed before sliding to the next one.
     *
     * The reels run back to back, so the moment one finishes the next begins —
     * and moving straight away whipped the view off a result before it could be
     * read. So: hold, then glide.
     *
     * Both are scaled from the INCOMING column's spin length rather than fixed.
     * The shortest spin is 700ms, and a fixed hold-plus-glide long enough to
     * feel unhurried on a rare 1750ms column would still be running when a
     * short one had already landed — the view would fall further behind with
     * every column. Sized as fractions, the pause is generous when there is
     * room and tightens when there is not, and it always arrives before the
     * next reel stops.
     */
    const span = durations[SLOTS[activeSlot].id] ?? 900;
    const dwell = wasFirst ? 0 : Math.min(460, Math.max(140, span * 0.3));
    const glide = Math.min(560, Math.max(260, span * 0.4));

    const cancel = () => {
      cancelAnimationFrame(scrollAnim.current.raf);
      clearTimeout(scrollAnim.current.timer);
      // Snap is suspended for the glide below. If a glide is interrupted — the
      // next column starting, or the component unmounting — it has to come
      // back, or swipe-to-snap stays dead for the rest of the session.
      cab.style.scrollSnapType = '';
    };
    cancel();

    const slide = () => {
      // Mandatory snap fights a per-frame scrollLeft, yanking the strip to the
      // nearest column mid-glide. Suspended for the duration; the destination
      // is a snap point anyway, so it re-engages cleanly.
      cab.style.scrollSnapType = 'none';
      const t0 = performance.now();
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / glide);
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        cab.scrollLeft = from + (target - from) * e;
        if (u < 1) {
          scrollAnim.current.raf = requestAnimationFrame(step);
        } else {
          cab.style.scrollSnapType = '';
        }
      };
      scrollAnim.current.raf = requestAnimationFrame(step);
    };

    scrollAnim.current.timer = window.setTimeout(slide, dwell);
    return cancel;
  }, [activeSlot, durations]);

  /* ----------------------------------------------------------- the lever */
  // A real slot lever is dragged, not clicked. Both work here: drag past the
  // commit point, or just click it.
  const [pull, setPull] = useState(0); // 0..1
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const moved = useRef(false);
  const cb = useRef({ onPull, disabled });
  cb.current = { onPull, disabled };

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      const delta = e.clientY - startY.current;
      if (Math.abs(delta) > 4) moved.current = true;
      setPull(Math.max(0, Math.min(1, delta / LEVER_TRAVEL)));
    };

    const up = () => {
      setDragging(false);
      setPull((p) => {
        // A committed drag OR a plain click both fire the pull.
        if (!cb.current.disabled && (p >= LEVER_COMMIT || !moved.current)) {
          cb.current.onPull();
        }
        return 0;
      });
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging]);

  // Snap home if the lever is disabled mid-drag (e.g. the pull just fired).
  useEffect(() => {
    if (disabled && !dragging) setPull(0);
  }, [disabled, dragging]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      // Capture so the pull survives the finger sliding off the knob, and so
      // the browser cannot reinterpret it as a page scroll mid-drag.
      e.currentTarget.setPointerCapture?.(e.pointerId);
      startY.current = e.clientY;
      moved.current = false;
      setDragging(true);
    },
    [disabled],
  );

  const armStyle = { transform: `scaleY(${1 - pull * 0.55})` };
  const knobStyle = { transform: `translateY(${pull * LEVER_TRAVEL}px)` };

  const tone = String(creditMode?.attrs?.color ?? 'none');

  return (
    <div className="machine">
      <div className="machine__top">
        <div className="machine__badge">
          <span className="machine__badge-sub">Delta Force</span>
          <span className="machine__badge-main">2 · Roll your kit</span>
        </div>
        <div className="machine__readouts">
          {/* The preset list used to be a grid buried in the settings panel.
              It is the same kind of choice as the difficulty, so it is the
              same control, in the same place. */}
          <DependencyChip
            label="Preset"
            value={preset}
            options={presetOptions}
            onPick={onPickPreset}
            tone="preset"
          />
          {/* Readable as before, but now also settable: you can start here
              instead of at the roulette wheel. */}
          <DependencyChip
            label="Difficulty"
            value={creditMode ? creditMode.name : null}
            options={modeOptions}
            onPick={onPickMode}
            tone={tone}
          />
        </div>
      </div>

      <div className="machine__body">
        <div className="cabinet" ref={cabinetRef}>
          <div className="cabinet__glass" aria-hidden="true" />
          <div className="payline" aria-hidden="true">
            <span className="payline__arrow payline__arrow--l">▶</span>
            <span className="payline__arrow payline__arrow--r">◀</span>
          </div>
          <div className="cabinet__reels">
            {SLOTS.map((slot) => (
              <SlotReel
                key={slot.id}
                slot={slot}
                entry={rolls[slot.id]?.entry ?? null}
                pool={pools[slot.id] ?? []}
                held={rolls[slot.id]?.held ?? false}
                spinning={!!spinning[slot.id]}
                duration={durations[slot.id] ?? 1600}
                onHold={() => onHold(slot.id)}
                onSpin={() => onSpin(slot.id)}
                canSpin={credits > 0}
                onNudge={(dir) => onNudge(slot.id, dir)}
                onSpinEnd={() => onSpinEnd(slot.id)}
                onTick={onTick}
                range={rangeFor(slot.id)}
              />
            ))}
          </div>
        </div>

        <div className="machine__side">
          <div
            className={`coinslot${credits === 0 ? ' is-hungry' : ''}`}
            ref={coinSlotRef}
            aria-label="Coin slot"
          >
            <div className="coinslot__mouth" />
            <span className="coinslot__text">{credits === 0 ? 'Insert token' : 'Inserted'}</span>
          </div>

          {/* The label lives INSIDE the button. It used to be positioned below
              the element's box, so clicking the one thing that said "PULL" hit
              nothing at all and the lever read as broken. */}
          <button
            type="button"
            className={`lever${dragging ? ' is-dragging' : ''}${
              pull >= LEVER_COMMIT ? ' is-committed' : ''
            }`}
            onPointerDown={onPointerDown}
            disabled={disabled}
            title={
              anySpinning
                ? 'Reels are still spinning'
                : credits === 0
                  ? 'Needs a token — spin the wheel to earn one'
                  : 'Drag down to spin all reels'
            }
            aria-label="Pull the lever to spin all reels"
          >
            <span className="lever__slot" aria-hidden="true">
              <span className="lever__arm" style={armStyle} />
              <span className="lever__knob" style={knobStyle} />
            </span>
            <span className="lever__text">
              {anySpinning ? 'SPINNING' : credits === 0 ? 'NO TOKEN' : 'PULL DOWN'}
            </span>
          </button>
        </div>
      </div>

      {settings}
    </div>
  );
});
