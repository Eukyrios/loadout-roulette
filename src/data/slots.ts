/**
 * Slot registry — the single source of truth for what appears on the board.
 *
 * Add a slot by appending to SLOTS. Everything downstream (reels, settings
 * panel, presets, URL encoding) is generated from this list.
 */

import type { Entry, SlotSpec } from './types';
import { TIER_NAME } from './rarity';
import {
  BACKPACKS,
  HELMETS,
  MAPS,
  MODES,
  MODE_GEAR_CAPS,
  OPERATORS,
  OPERATOR_CLASSES,
  RIGS,
  TIER_MAX,
  TIER_MIN,
  VESTS,
  WEAPONS,
  WEAPON_CLASSES,
} from './deltaforce';

/**
 * Gate a gear slot on the difficulty's maximum allowed tier. Slots with no cap
 * for the rolled difficulty pass everything through.
 */
const gearCap = (slotId: string) => ({
  slotId: 'mode',
  match: (entry: Entry, parent: Entry) => {
    const cap = MODE_GEAR_CAPS[parent.id]?.[slotId];
    if (cap == null) return true;
    return Number(entry.attrs?.tier ?? 0) <= cap;
  },
});

const tierFilter = (label = 'Tier') =>
  ({
    kind: 'range' as const,
    attr: 'tier',
    label,
    min: TIER_MIN,
    max: TIER_MAX,
    // The bound reads as the colour it selects. The number is still what the
    // filter compares against; only the label changed.
    format: (v: number) => TIER_NAME[v] ?? `Tier ${v}`,
  });

/**
 * DECLARATION ORDER IS THE STOP ORDER. The reels all start together and settle
 * top-to-bottom of this list, so reordering here reorders the machine.
 *
 * Difficulty is NOT a reel — it comes from the roulette wheel upstairs. Its
 * result is injected into the rolls record under the id `mode`, which is what
 * the map slot's `dependsOn` gate reads. See `VIRTUAL_MODE_SLOT` below.
 */
export const SLOTS: SlotSpec[] = [
  {
    id: 'map',
    label: 'Map',
    group: 'core',
    entries: MAPS,
    filters: [{ kind: 'multi', attr: 'name', label: 'Maps', values: MAPS.map((x) => x.name) }],
    // Only maps that actually run the rolled tier can come up.
    dependsOn: {
      slotId: 'mode',
      match: (entry, parent) => String(entry.attrs?.modes ?? '').split(',').includes(parent.id),
    },
  },
  {
    id: 'operator',
    label: 'Operator',
    group: 'core',
    entries: OPERATORS,
    filters: [
      { kind: 'multi', attr: 'class', label: 'Operator classes', values: [...OPERATOR_CLASSES] },
    ],
  },
  {
    id: 'weapon',
    label: 'Primary weapon',
    group: 'core',
    entries: WEAPONS,
    filters: [
      { kind: 'multi', attr: 'class', label: 'Weapon types', values: [...WEAPON_CLASSES] },
    ],
  },
  {
    id: 'helmet',
    label: 'Helmet',
    group: 'gear',
    entries: HELMETS,
    filters: [tierFilter()],
    // Easy refuses to deploy with a helmet above Tier 4.
    dependsOn: gearCap('helmet'),
  },
  {
    id: 'vest',
    label: 'Vest',
    group: 'gear',
    entries: VESTS,
    filters: [tierFilter()],
    // Same Tier 4 ceiling on Easy.
    dependsOn: gearCap('vest'),
  },
  {
    id: 'rig',
    label: 'Chest rig',
    group: 'gear',
    entries: RIGS,
    filters: [tierFilter()],
  },
  {
    id: 'backpack',
    label: 'Backpack',
    group: 'gear',
    entries: BACKPACKS,
    filters: [tierFilter()],
  },
];

/**
 * Not a reel — a stand-in so the roulette result can live in the same rolls
 * record as everything else and satisfy the map slot's `dependsOn` gate.
 */
export const VIRTUAL_MODE_SLOT: SlotSpec = {
  id: 'mode',
  label: 'Difficulty',
  entries: MODES,
};

export const SLOT_BY_ID = Object.fromEntries(SLOTS.map((s) => [s.id, s]));

/** Slots in declaration order, grouped for layout. */
export const SLOT_GROUPS: { id: string; slots: SlotSpec[] }[] = (() => {
  const order: string[] = [];
  const byGroup = new Map<string, SlotSpec[]>();
  for (const slot of SLOTS) {
    const key = slot.group ?? slot.id;
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
      order.push(key);
    }
    byGroup.get(key)!.push(slot);
  }
  return order.map((id) => ({ id, slots: byGroup.get(id)! }));
})();
