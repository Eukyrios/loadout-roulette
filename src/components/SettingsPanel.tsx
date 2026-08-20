import type { AppSettings, FilterState, SlotSpec } from '../data/types';
import { SLOTS } from '../data/slots';
import { multiKey, rangeBounds, rangeKey } from '../engine/filters';
import { PRESETS } from '../engine/presets';

interface Props {
  open: boolean;
  onToggle: () => void;
  settings: AppSettings;
  onSettings: (patch: Partial<AppSettings>) => void;
  filters: FilterState;
  onFilters: (next: FilterState) => void;
  onPreset: (id: string) => void;
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
    <div className="rangectl">
      <div className="rangectl__title">{slot.label}</div>
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
    </div>
  );
}

/** Chip row for one multi-select filter. */
function MultiControl({
  title,
  values,
  selected,
  onChange,
}: {
  title: string;
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    onChange(next);
  };
  const allOn = selected.length === values.length;

  return (
    <div className="multictl">
      <div className="multictl__head">
        <span className="rangectl__title">{title}</span>
        <button type="button" className="btn btn--link" onClick={() => onChange(allOn ? [] : [...values])}>
          {allOn ? 'none' : 'all'}
        </button>
      </div>
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
    </div>
  );
}

export function SettingsPanel({
  open,
  onToggle,
  settings,
  onSettings,
  filters,
  onFilters,
  onPreset,
  onReset,
}: Props) {
  const rangeSlots = SLOTS.filter((s) => s.filters?.some((f) => f.kind === 'range'));
  const multiSlots = SLOTS.filter((s) => s.filters?.some((f) => f.kind === 'multi'));

  return (
    <section className={`panel${open ? ' is-open' : ''}`}>
      <button type="button" className="panel__toggle" onClick={onToggle} aria-expanded={open}>
        <span>Settings</span>
        <span className="panel__chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="panel__body">
          <div className="panel__block">
            <h3 className="panel__h">Behaviour</h3>
            <div className="switches">
              {(
                [
                  ['sounds', 'Enable sounds'],
                  ['instantSpin', 'Instant spin'],
                  ['showNudgers', 'Show nudge arrows'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="switch">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => onSettings({ [key]: e.target.checked })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="panel__block">
            <h3 className="panel__h">Presets</h3>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" className="preset" onClick={() => onPreset(p.id)}>
                  <span className="preset__name">{p.name}</span>
                  <span className="preset__blurb">{p.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel__block">
            <h3 className="panel__h">Tier bounds per slot</h3>
            <div className="grid-2">
              {rangeSlots.map((slot) =>
                (slot.filters ?? [])
                  .filter((f) => f.kind === 'range')
                  .map((f) => {
                    if (f.kind !== 'range') return null;
                    const key = rangeKey(slot.id, f.attr);
                    const bounds = rangeBounds(slot, f.attr, [f.min, f.max]);
                    const value = filters.ranges[key] ?? bounds;
                    return (
                      <RangeControl
                        key={key}
                        slot={slot}
                        label={f.label}
                        format={f.format ?? String}
                        bounds={bounds}
                        value={value}
                        onChange={(next) =>
                          onFilters({ ...filters, ranges: { ...filters.ranges, [key]: next } })
                        }
                      />
                    );
                  }),
              )}
            </div>
          </div>

          {multiSlots.map((slot) =>
            (slot.filters ?? [])
              .filter((f) => f.kind === 'multi')
              .map((f) => {
                if (f.kind !== 'multi') return null;
                const key = multiKey(slot.id, f.attr);
                return (
                  <div className="panel__block" key={key}>
                    <MultiControl
                      title={f.label}
                      values={f.values}
                      selected={filters.multi[key] ?? f.values}
                      onChange={(next) =>
                        onFilters({ ...filters, multi: { ...filters.multi, [key]: next } })
                      }
                    />
                  </div>
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
