import type { FilterState, SlotSpec } from '../data/types';
import { SLOTS } from '../data/slots';
import { multiKey } from '../engine/filters';

interface Props {
  open: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFilters: (next: FilterState) => void;
  onReset: () => void;
}

/**
 * A two-handled slider for one range filter.
 *
 * One line, both bounds. It was a pair of stepper rows, which took two lines
 * and four buttons to say something you can see at a glance on a track — and
 * under a reel column there is no room for two lines.
 *
 * There is no two-handled input in HTML, so this is the standard construction:
 * two ordinary range inputs stacked on the same track, each transparent to the
 * pointer except for its own handle, with a filled span drawn between them.
 * They stay real inputs, so arrow keys, Home/End and screen readers all work
 * without any of it being reimplemented.
 */
export function RangeControl({
  slot,
  label,
  format,
  colorFor,
  bounds,
  value,
  onChange,
}: {
  slot: SlotSpec;
  label: string;
  format: (v: number) => string;
  /**
   * Optional ink for a bound, given its value.
   *
   * Only meaningful once a bound is named after a colour: printing the word
   * "Gold" in the interface green says two different things at once. Left
   * undefined the readout takes the accent, the way every other number here
   * does.
   */
  colorFor?: (v: number) => string | undefined;
  bounds: [number, number];
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const [min, max] = bounds;
  const span = Math.max(1, max - min);
  const pct = (v: number) => ((v - min) / span) * 100;

  /** Clamp so the handles can meet but never cross. */
  const setLo = (v: number) => onChange([Math.min(v, hi), hi]);
  const setHi = (v: number) => onChange([lo, Math.max(v, lo)]);

  return (
    <div className="dual">
      <div className="dual__head">
        <span className="dual__label">{label}</span>
        <span className="dual__value">
          <span style={{ color: colorFor?.(lo) }}>{format(lo)}</span>
          {lo !== hi && (
            <>
              <span className="dual__dash"> – </span>
              <span style={{ color: colorFor?.(hi) }}>{format(hi)}</span>
            </>
          )}
        </span>
      </div>

      <div className="dual__track">
        <span className="dual__rail" aria-hidden="true" />
        <span
          className="dual__fill"
          aria-hidden="true"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        {/*
          Whichever handle is in the top half of the track takes the higher
          stacking order. With both parked on the same value the one on top is
          the only one you can grab, and this keeps that from being a dead end
          at either extreme.
        */}
        <input
          type="range"
          className="dual__in"
          style={{ zIndex: lo > (min + max) / 2 ? 4 : 3 }}
          min={min}
          max={max}
          step={1}
          value={lo}
          aria-label={`${slot.label} minimum ${label}`}
          onChange={(e) => setLo(Number(e.target.value))}
        />
        <input
          type="range"
          className="dual__in"
          style={{ zIndex: 4 }}
          min={min}
          max={max}
          step={1}
          value={hi}
          aria-label={`${slot.label} maximum ${label}`}
          onChange={(e) => setHi(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

/** Chip row for one multi-select filter. */
function Chips({
  values,
  selected,
  onChange,
}: {
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div className="chips">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          className={`chip${selected.includes(v) ? ' is-on' : ''}`}
          onClick={() => toggle(v)}
          aria-pressed={selected.includes(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/** One titled section of the panel. */
function Block({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="panel__block">
      <div className="panel__head">
        <h3 className="panel__h">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel({ open, onToggle, filters, onFilters, onReset }: Props) {
  // Every slot that has a picker gets its own section, in SLOTS order.
  const multiSlots = SLOTS.filter((s) => s.filters?.some((f) => f.kind === 'multi'));

  return (
    <section className={`panel${open ? ' is-open' : ''}`}>
      <button type="button" className="panel__toggle" onClick={onToggle} aria-expanded={open}>
        {/* No eyebrow: this one lives inside the machine, under a crown that
            already says Delta Force. */}
        <span className="panel__toggle-text">
          <span className="panel__toggle-title">Settings</span>
        </span>
        <span className="panel__chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="panel__body">
          {/* Presets and the per-slot tier bounds are not here any more: the
              presets are a chip on the machine's crown and the bounds sit under
              the column each one governs. What is left is the pickers, which
              have no natural home on a reel. */}
          {/* --- pickers: maps, operator classes, weapon types ------------- */}
          {multiSlots.map((slot) =>
            (slot.filters ?? [])
              .filter((f) => f.kind === 'multi')
              .map((f) => {
                if (f.kind !== 'multi') return null;
                const key = multiKey(slot.id, f.attr);
                const selected = filters.multi[key] ?? f.values;
                const allOn = selected.length === f.values.length;
                return (
                  <Block
                    key={key}
                    title={f.label}
                    action={
                      <button
                        type="button"
                        className="btn btn--link"
                        onClick={() =>
                          onFilters({
                            ...filters,
                            multi: { ...filters.multi, [key]: allOn ? [] : [...f.values] },
                          })
                        }
                      >
                        {allOn ? 'none' : 'all'}
                      </button>
                    }
                  >
                    <Chips
                      values={f.values}
                      selected={selected}
                      onChange={(next) =>
                        onFilters({ ...filters, multi: { ...filters.multi, [key]: next } })
                      }
                    />
                  </Block>
                );
              }),
          )}

          <div className="panel__foot">
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Reset all filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
