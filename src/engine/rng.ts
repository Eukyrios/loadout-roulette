/**
 * Seeded RNG so a roll can be shared as a short code and reproduced exactly.
 *
 * mulberry32 — small, fast, good enough distribution for picking list items.
 */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a — turns a share code into a numeric seed. */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A short, human-typable code. Avoids vowels so it can't spell anything. */
export function randomSeedCode(): string {
  const alphabet = '23456789BCDFGHJKLMNPQRSTVWXZ';
  let out = '';
  const bytes = new Uint32Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/** Weighted pick. Entries without an explicit weight count as 1. */
export function pickWeighted<T extends { weight?: number }>(items: T[], rng: Rng): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((sum, it) => sum + (it.weight ?? 1), 0);
  if (total <= 0) return null;
  let roll = rng() * total;
  for (const it of items) {
    roll -= it.weight ?? 1;
    if (roll <= 0) return it;
  }
  return items[items.length - 1];
}
