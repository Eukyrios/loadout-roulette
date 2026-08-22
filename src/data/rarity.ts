/**
 * The in-game rarity ladder, in one place.
 *
 * Delta Force grades every item 1-6 and colours it accordingly: grey, green,
 * blue, purple, gold, red. The reels already use this ladder through the
 * `--tier` custom property in index.css — these are the SAME six colours, held
 * here so the canvas-drawn scenes (the dart board's wedges, the keycard faces)
 * can reach them too. If one set changes the other must change with it; there
 * is no way to import a CSS variable into a 2D canvas.
 */

/** Tier 1-6 as an `r, g, b` triple, matching `.reel--tN { --tier }`. */
export const TIER_RGB: Record<number, [number, number, number]> = {
  1: [154, 168, 178],
  2: [76, 175, 109],
  3: [74, 144, 217],
  4: [168, 106, 224],
  5: [224, 162, 58],
  6: [224, 80, 58],
};

/** What each grade is called in game, for labels. */
export const TIER_NAME: Record<number, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
  6: 'Exotic',
};

/** Tier as `#rrggbb`. Unknown tiers fall back to the neutral grey of tier 1. */
export function tierHex(tier: number | null | undefined): string {
  const [r, g, b] = TIER_RGB[tier ?? 0] ?? TIER_RGB[1];
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Tier as `rgba(...)`, for washes and glows. */
export function tierRgba(tier: number | null | undefined, alpha: number): string {
  const [r, g, b] = TIER_RGB[tier ?? 0] ?? TIER_RGB[1];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Tier as a three.js-style hex number. */
export function tierNum(tier: number | null | undefined): number {
  const [r, g, b] = TIER_RGB[tier ?? 0] ?? TIER_RGB[1];
  return (r << 16) | (g << 8) | b;
}

/**
 * A round's rarity grade.
 *
 * Checked against deltaforceitems.com's per-item Grade field rather than
 * assumed. The rule that came back:
 *
 *  - For penetration levels 1-6 the grade IS the penetration level. M995 is
 *    pen 5 and grade 5; RRLP is pen 1 and grade 1. No exceptions found.
 *  - Penetration 0 — the expanding and fragmenting rounds — has no grade 0.
 *    They are graded 3, which is higher than their armour performance and
 *    reflects what they cost and what they do to an unarmoured target. My
 *    first guess put them at the bottom of the ladder; the data says
 *    otherwise, and 12 Gauge Slug RIP is graded 2 rather than 3 on top of
 *    that, so it is listed by name.
 *  - Penetration 7 exists (.50 BMG M903 SLAP, .338 Lap Mag AP) but the colour
 *    ladder stops at 6, so those take the top colour.
 */
const PEN0_GRADE: Record<string, number> = {
  '12-gauge-slug-rip': 2,
};
const PEN0_DEFAULT = 3;

export function ammoTier(pen: number | null, id?: string): number {
  if (pen === null) return 1;
  if (pen === 0) return (id && PEN0_GRADE[id]) || PEN0_DEFAULT;
  return Math.min(6, pen);
}
