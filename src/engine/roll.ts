/**
 * The randomizer. Deterministic given (seed, spin count, filters), so a result
 * can be reproduced from a short share code.
 */

import type { Entry, FilterState, Roll } from '../data/types';
import { SLOTS } from '../data/slots';
import { WHEEL_POCKETS } from '../data/deltaforce';
import { poolFor } from './filters';
import { hashString, mulberry32, pickWeighted } from './rng';

/**
 * Each slot gets its own RNG stream, derived from the seed plus the slot id and
 * how many times that slot has spun. Re-spinning one reel therefore never
 * disturbs the others.
 */
function streamFor(seed: string, slotId: string, spin: number) {
  return mulberry32(hashString(`${seed}|${slotId}|${spin}`));
}

/** The parent entry gating `slotId`, if it has a `dependsOn`. */
function parentOf(slotId: string, rolls: Record<string, Roll>): Entry | null {
  const slot = SLOTS.find((s) => s.id === slotId);
  if (!slot?.dependsOn) return null;
  return rolls[slot.dependsOn.slotId]?.entry ?? null;
}

export function rollSlot(
  slotId: string,
  seed: string,
  spin: number,
  filters: FilterState,
  rolls: Record<string, Roll>,
  /** Avoid repeating this entry when the pool is big enough to allow it. */
  previous?: Entry | null,
): Entry | null {
  const slot = SLOTS.find((s) => s.id === slotId);
  if (!slot) return null;

  const pool = poolFor(slot, filters, parentOf(slotId, rolls));
  if (pool.length === 0) return null;

  const candidates = pool.length > 1 && previous ? pool.filter((e) => e.id !== previous.id) : pool;

  return pickWeighted(candidates.length ? candidates : pool, streamFor(seed, slotId, spin));
}

/**
 * Roll every slot that is not held, in declaration order, so a gated slot sees
 * the parent result from THIS roll rather than the previous one.
 */
export function rollAll(
  seed: string,
  spins: Record<string, number>,
  filters: FilterState,
  current: Record<string, Roll>,
): Record<string, Roll> {
  // Seed the working set with anything not on the board (e.g. the roulette's
  // `mode`), so dependsOn gates can still find their parent.
  const next: Record<string, Roll> = { ...current };

  for (const slot of SLOTS) {
    const existing = current[slot.id];
    if (existing?.held && existing.entry) {
      next[slot.id] = existing;
      continue;
    }
    next[slot.id] = {
      slotId: slot.id,
      entry: rollSlot(slot.id, seed, spins[slot.id] ?? 0, filters, next, existing?.entry),
      held: false,
    };
  }
  return next;
}

/** Pick from a standalone list (mod budget, challenge) using the same streams. */
export function rollList(list: Entry[], seed: string, key: string, spin: number): Entry | null {
  return pickWeighted(list, streamFor(seed, key, spin));
}

/** A d6 result, 1–6. Seeded on the same streams as everything else. */
export function rollDie(seed: string, key: string, spin: number): number {
  return 1 + Math.floor(streamFor(seed, `die:${key}`, spin)() * 6);
}

/** Which wheel pocket wins this spin. Seeded, so a share link reproduces it. */
export function rollPocket(seed: string, spin: number): number {
  return Math.floor(streamFor(seed, 'wheel', spin)() * WHEEL_POCKETS.length) % WHEEL_POCKETS.length;
}

/** Slots whose filters have excluded everything — surfaced as a warning. */
export function emptySlots(filters: FilterState, rolls: Record<string, Roll>): string[] {
  return SLOTS.filter((s) => poolFor(s, filters, parentOf(s.id, rolls)).length === 0).map(
    (s) => s.label,
  );
}
