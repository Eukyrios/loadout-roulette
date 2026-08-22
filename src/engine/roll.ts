/**
 * The randomizer. Deterministic given (seed, spin count, filters), so a result
 * can be reproduced from a short share code.
 */

import type { Entry, FilterState, Roll } from '../data/types';
import { SLOTS } from '../data/slots';
import { STICK_BUNDLE, WHEEL_POCKETS } from '../data/deltaforce';
import { ATTACH_BY_CAT, ATTACH_SLOTS } from '../data/attachments';
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

/** Which stick comes out of the cup. Index into STICK_BUNDLE. */
export function rollStick(seed: string, spin: number): number {
  return Math.floor(streamFor(seed, 'sticks', spin)() * STICK_BUNDLE.length) % STICK_BUNDLE.length;
}

/**
 * Which key comes out of the fan: an index into the map's keycard deck.
 *
 * Drawn WITHOUT replacement — `taken` are the ones already in hand, and you
 * cannot carry the same key twice. Returns -1 when the deck is exhausted.
 */
export function rollKeycard(seed: string, spin: number, deck: number, taken: number[]): number {
  const free: number[] = [];
  for (let i = 0; i < deck; i++) if (!taken.includes(i)) free.push(i);
  if (free.length === 0) return -1;
  return free[Math.floor(streamFor(seed, 'keys', spin)() * free.length) % free.length];
}

/**
 * What is inside a capsule: `count` distinct attachments, one from each of
 * `count` different slots.
 *
 * Distinct SLOTS rather than distinct items, so a pull never comes out as five
 * muzzles — the row reads as a kit even though nothing about it fits together.
 */
export function rollCapsule(seed: string, spin: number, count: number): number[][] {
  const rng = streamFor(seed, 'capsule', spin);
  const slots = [...ATTACH_SLOTS];
  // Fisher-Yates on the slot list, then one item from each of the first
  // `count` — drawing slots independently would repeat them.
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  const out: number[][] = [];
  for (const slot of slots.slice(0, count)) {
    const pool = ATTACH_BY_CAT[slot] ?? [];
    if (pool.length === 0) continue;
    out.push([ATTACH_SLOTS.indexOf(slot as never), Math.floor(rng() * pool.length) % pool.length]);
  }
  return out;
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

/**
 * Which round the dart lands on.
 *
 * Just an index into the weapon's own ammo list — the board is built from the
 * gun's caliber, so a round it cannot chamber is never a possible outcome.
 * Seeded like everything else, so a shared link throws the same dart.
 */
export function rollDart(seed: string, spin: number, count: number): number {
  if (count <= 0) return -1;
  return Math.floor(streamFor(seed, 'dart', spin)() * count) % count;
}
