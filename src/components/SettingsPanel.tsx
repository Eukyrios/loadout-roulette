import type { FilterState, SlotSpec } from '../data/types';
import { SLOTS } from '../data/slots';
import { multiKey, rangeBounds, rangeKey } from '../engine/filters';

interface Props {
  open: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFilters: (next: FilterState) => void;
  onReset: () => void;
}

/** A min/max stepper pair for one range filter. */
function RangeControl({
  slot,
  label,
  format,
  bounds,
  value,
  onChange,
}: {
  slot: SlotSpec;
  label: string;
  format: (v: number) => string;
  bounds: [number, number];
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const [min, max] = bounds;

  const step = (which: 0 | 1, dir: -1 | 1) => {
    const next: [number, number] = [lo, hi];
    next[which] = Math.min(max, Math.max(min, next[which] + dir));
    // Keep min <= max by pushing the other bound along.
    if (which === 0 && next[0] > next[1]) next[1] = next[0];
    if (which === 1 && next[1] < next[0]) next[0] = next[1];
    onChange(next);
  };

  return (
    <div className="rangectl__row">
      {([0, 1] as const).map((which) => (
        <div className="stepper" key={which}>
          <span className="stepper__label">{which === 0 ? 'Min' : 'Max'}</span>
          <div className="stepper__body">
            <button
              type="button"
              className="btn btn--icon"
              onClick={() => step(which, -1)}
              disabled={value[which] <= min}
              aria-label={`Decrease ${slot.label} ${which === 0 ? 'minimum' : 'maximum'} ${label}`}
            >
              ◀
            </button>
            <span className="stepper__value">{format(value[which])}</span>
            <button
              type="button"
              className="btn btn--icon"
              onClick={() => step(which, 1)}
              disabled={value[which] >= max}
              aria-label={`Increase ${slot.label} ${which === 0 ? 'minimum' : 'maximum'} ${label}`}
            >
              ▶
            </button>
          </div>
        </div>
      ))}
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
  // Every slot that has a filter gets its own section, in SLOTS order.
  const rangeSlots = SLOTS.filter((s) => s.filters?.some((f) => f.kind === 'range'));
  const multiSlots = SLOTS.filter((s) => s.filters?.some((f) => f.kind === 'multi'));

  return (
    <section className={`panel${open ? ' is-open' : ''}`}>
      <button type="button" className="panel__toggle" onClick={onToggle} aria-expanded={open}>
        <span className="panel__toggle-text">
          <span className="secttl__eyebrow">Delta Force</span>
          <span className="panel__toggle-title">Settings</span>
        </span>
        <span className="panel__chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="panel__body">
          {/* --- tier bounds, one section per gear slot -------------------- */}
          <div className="panel__grid">
            {rangeSlots.map((slot) =>
              (slot.filters ?? [])
                .filter((f) => f.kind === 'range')
                .map((f) => {
                  if (f.kind !== 'range') return null;
                  const key = rangeKey(slot.id, f.attr);
                  const bounds = rangeBounds(slot, f.attr, [f.min, f.max]);
                  const value = filters.ranges[key] ?? bounds;
                  return (
                    <Block key={key} title={slot.label}>
                      <RangeControl
                        slot={slot}
                        label={f.label}
                        format={f.format ?? String}
                        bounds={bounds}
                        value={value}
                        onChange={(next) =>
                          onFilters({ ...filters, ranges: { ...filters.ranges, [key]: next } })
                        }
                      />
                    </Block>
                  );
                }),
            )}
          </div>

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
