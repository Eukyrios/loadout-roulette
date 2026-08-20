import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
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
  /** True until a coin has been inserted — reels are inert. */
  locked: boolean;
  credits: number;
  /** Difficulty of the token currently in the machine. */
  creditMode: Entry | null;
  onHold: (slotId: string) => void;
  onSpin: (slotId: string) => void;
  onNudge: (slotId: string, dir: -1 | 1) => void;
  onSpinEnd: (slotId: string) => void;
  onTick: () => void;
  onPull: () => void;
  anySpinning: boolean;
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
    locked,
    credits,
    creditMode,
    onHold,
    onSpin,
    onNudge,
    onSpinEnd,
    onTick,
    onPull,
    anySpinning,
  },
  coinSlotRef,
) {
  const disabled = credits === 0 || anySpinning;

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
      startY.current = e.clientY;
      moved.current = false;
      setDragging(true);
    },
    [disabled],
  );

  const armStyle = { transform: `scaleY(${1 - pull * 0.55})` };
  const knobStyle = { transform: `translateY(${pull * LEVER_TRAVEL}px)` };

  // Dim the cabinet only when there is genuinely nothing to do: never paid AND
  // no credit waiting.
  const dimmed = locked && credits === 0;
  const tone = creditMode?.attrs?.color ?? 'none';

  return (
    <div className={`machine${dimmed ? ' is-locked' : ''}`}>
      <div className="machine__top">
        <div className="machine__badge">
          <span className="machine__badge-sub">Delta Force</span>
          <span className="machine__badge-main">2 · Roll your kit</span>
        </div>
        <div className={`machine__mode machine__mode--${tone}`}>
          <span className="machine__mode-label">Difficulty</span>
          <span className="machine__mode-value">
            {creditMode ? creditMode.name : 'No token'}
          </span>
        </div>
      </div>

      <div className="machine__body">
        <div className="cabinet">
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
                locked={locked}
                onHold={() => onHold(slot.id)}
                onSpin={() => onSpin(slot.id)}
                onNudge={(dir) => onNudge(slot.id, dir)}
                onSpinEnd={() => onSpinEnd(slot.id)}
                onTick={onTick}
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
    </div>
  );
});
