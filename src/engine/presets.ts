/**
 * Named filter presets. Each preset is a partial override applied on top of
 * the wide-open default, so adding a slot never breaks an existing preset.
 */

import type { FilterState } from '../data/types';
import { defaultFilterState, rangeKey } from './filters';

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  apply: (state: FilterState) => FilterState;
}

const setTiers = (state: FilterState, lo: number, hi: number): FilterState => {
  const ranges = { ...state.ranges };
  for (const slotId of ['helmet', 'vest', 'rig', 'backpack']) {
    const key = rangeKey(slotId, 'tier');
    const current = ranges[key];
    if (!current) continue;
    // Never push a bound past what the slot actually stocks.
    ranges[key] = [Math.max(current[0], Math.min(lo, current[1])), Math.min(current[1], Math.max(hi, current[0]))];
  }
  return { ...state, ranges };
};

export const PRESETS: Preset[] = [
  {
    id: 'everything',
    name: 'Everything',
    blurb: 'No constraints. Every item in every pool.',
    apply: (s) => s,
  },
  {
    id: 'budget',
    name: 'Budget run',
    blurb: 'Gray to blue only. Cheap to lose.',
    apply: (s) => setTiers(s, 1, 3),
  },
  {
    id: 'normal',
    name: 'Normal',
    blurb: 'Blue to gold, no snipers or specials.',
    apply: (s) => ({
      ...setTiers(s, 3, 5),
      multi: {
        ...s.multi,
        'weapon:class': ['Assault Rifle', 'SMG', 'Marksman Rifle', 'Light Machinegun', 'Shotgun'],
      },
    }),
  },
  {
    id: 'full-send',
    name: 'Full send',
    blurb: 'Gold and red armor only. Bring the good stuff.',
    apply: (s) => setTiers(s, 5, 6),
  },
  {
    id: 'gremlin',
    name: 'Gremlin',
    blurb: 'Worst gear, silliest guns. Maximum disrespect.',
    apply: (s) => ({
      ...setTiers(s, 1, 2),
      multi: {
        ...s.multi,
        'weapon:class': ['Shotgun', 'Pistol', 'Special'],
      },
    }),
  },
];

export function applyPreset(id: string): FilterState {
  const preset = PRESETS.find((p) => p.id === id);
  const base = defaultFilterState();
  return preset ? preset.apply(base) : base;
}
