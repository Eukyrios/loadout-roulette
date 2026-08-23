/**
 * Turns the user's settings into the candidate pool for each slot.
 */

import type { Entry, FilterState, Roll, SlotSpec } from '../data/types';
import { entryImageSrc } from '../data/icons';
import { SLOTS } from '../data/slots';

export const rangeKey = (slotId: string, attr: string) => `${slotId}:${attr}`;
export const multiKey = (slotId: string, attr: string) => `${slotId}:${attr}`;

/** Every filter at its widest setting. */
export function defaultFilterState(): FilterState {
  const ranges: FilterState['ranges'] = {};
  const multi: FilterState['multi'] = {};
  for (const slot of SLOTS) {
    for (const f of slot.filters ?? []) {
      if (f.kind === 'range') {
        // Clamp to what the pool actually contains, so a slot whose items stop
        // at tier 5 doesn't offer a meaningless tier 6 bound.
        const present = slot.entries
          .map((e) => Number(e.attrs?.[f.attr]))
          .filter((n) => Number.isFinite(n));
        const lo = present.length ? Math.max(f.min, Math.min(...present)) : f.min;
        const hi = present.length ? Math.min(f.max, Math.max(...present)) : f.max;
        ranges[rangeKey(slot.id, f.attr)] = [lo, hi];
      } else {
        multi[multiKey(slot.id, f.attr)] = [...f.values];
      }
    }
  }
  return { ranges, multi, artOnly: true };
}

/** The bounds a range filter is allowed to move between for a given slot. */
export function rangeBounds(slot: SlotSpec, attr: string, fallback: [number, number]): [number, number] {
  const present = slot.entries.map((e) => Number(e.attrs?.[attr])).filter((n) => Number.isFinite(n));
  if (!present.length) return fallback;
  return [Math.min(...present), Math.max(...present)];
}

/**
 * Candidates for one slot under the current filter state.
 *
 * `parent` is the entry this slot's `dependsOn` gate applies to. Passing
 * `undefined` for a slot that has a gate leaves the gate open — callers that
 * care use `resolvePools` instead.
 */
export function poolFor(slot: SlotSpec, state: FilterState, parent?: Entry | null): Entry[] {
  const gated =
    slot.dependsOn && parent
      ? slot.entries.filter((e) => slot.dependsOn!.match(e, parent))
      : slot.entries;

  return gated.filter((entry) => {
    // Checked before the per-slot filters because it applies to every column,
    // including the three that carry no filters of their own. `!== false` so a
    // filter set saved before this flag existed gets it on — see FilterState.
    if (state.artOnly !== false && !entryImageSrc(entry.id)) return false;
    for (const f of slot.filters ?? []) {
      const value = entry.attrs?.[f.attr];
      if (f.kind === 'range') {
        const bound = state.ranges[rangeKey(slot.id, f.attr)];
        if (!bound) continue;
        const n = Number(value);
        if (!Number.isFinite(n)) return false;
        if (n < bound[0] || n > bound[1]) return false;
      } else {
        const allowed = state.multi[multiKey(slot.id, f.attr)];
        if (!allowed) continue;
        if (typeof value !== 'string') return false;
        if (!allowed.includes(value)) return false;
      }
    }
    return true;
  });
}

/**
 * Pools for every slot, walking SLOTS in declaration order so a gated slot
 * sees its parent's current result. This is the function the UI should use.
 */
export function resolvePools(
  state: FilterState,
  rolls: Record<string, Roll>,
): Record<string, Entry[]> {
  const out: Record<string, Entry[]> = {};
  for (const slot of SLOTS) {
    const parent = slot.dependsOn ? (rolls[slot.dependsOn.slotId]?.entry ?? null) : null;
    out[slot.id] = poolFor(slot, state, parent);
  }
  return out;
}
