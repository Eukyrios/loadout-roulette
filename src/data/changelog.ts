/**
 * The build log: what changed, newest first.
 *
 * A record of the work, not an explanation of the app. Each entry is one
 * round of changes, written as what was added or reworked — if a line reads
 * like it is teaching you how to use the thing, it belongs on the stage
 * itself, not here.
 *
 * Ordered rather than dated. This was built in a run of sessions rather than
 * on a release schedule, and a made-up date on every entry would be worse than
 * no date at all.
 */

export interface LogEntry {
  /** Short title for the round of changes. */
  title: string;
  notes: string[];
}

export const CHANGELOG: LogEntry[] = [
  {
    title: 'A control bar, always on screen',
    notes: [
      'Added a bar pinned to the bottom of the window: animation on or off, mute, and a volume slider. Remembered across visits.',
      'With animation off a reel puts its answer straight up rather than running a shortened spin, and the 3D stages play their sequences faster than a frame.',
      'Rolling the machine now hands its results to the stages below it, clearing anything that had been set by hand — so one pull sets up everything downstream, and any of it can still be overridden afterwards.',
    ],
  },
  {
    title: 'Filters folded into the machine',
    notes: [
      'The settings panel moved inside the cabinet itself, since every filter left in it narrows those reels and nothing else. It takes the machine\u2019s bottom edge as its own and drops its eyebrow — the crown above already says whose machine it is.',
      'Tier bounds now sit above the column they govern, instead of in a grid four sections down a panel, and are one two-handled slider rather than two rows of steppers.',
      'Preset selection became a chip on the machine crown, next to the difficulty.',
    ],
  },
  {
    title: 'Stages can be driven out of order',
    notes: [
      'Added a settable box to every stage that depends on an earlier one: difficulty, weapon, caliber, map.',
      'Typing filters as you go and ignores punctuation, so "762x39" finds 7.62x39mm.',
      'Hand-set values are flagged and can be cleared back to whatever was rolled.',
      'Naming a caliber narrows the ammunition wheel to that caliber alone, so a spin decides the grade rather than the round.',
    ],
  },
  {
    title: 'Stage five replaced with a spinning wheel',
    notes: [
      'Six rounds on a rim, a fixed pointer, a weighted deceleration and a rock into the detent as the pegs catch.',
      'Wooden rim, gold pointer and pegs, on the same green baize as the rest of the set.',
      'The capsule machine got that table too — both scenes had been objects in a black void.',
    ],
  },
  {
    title: 'Ammunition data added',
    notes: [
      'Twenty calibers with penetration levels, prices and pictures where they are published.',
      'Every weapon mapped to the caliber it chambers.',
      'Seven calibers belong to guns no source documents fully; those are marked partial rather than filled in with invented figures.',
    ],
  },
  {
    title: 'Rarity colour unified',
    notes: [
      'One 1-6 ladder shared by the reels, the keycards and the ammunition wheel.',
      'Keycards carry their grade on the header, border and face; all 59 across the four mapped locations are graded.',
      'Ammunition grades were checked against a source rather than inferred from penetration.',
    ],
  },
  {
    title: 'Item pictures mirrored into the project',
    notes: [
      'Attachment and ammunition art is served from here, so the app makes no third-party request at runtime.',
      'Added npm run icons to fill the mirror, and a drawn fallback for anything it has not got.',
    ],
  },
  {
    title: 'Stage four added: the capsule machine',
    notes: [
      'A gashapon machine that shakes, drops a capsule, opens it and lays out five attachment cards.',
      '414 attachments collected with their stat lines and prices.',
      'Fit is not checked, and the stage says so rather than implying otherwise.',
    ],
  },
  {
    title: 'Prices put on a schedule',
    notes: [
      'A daily job refreshes market prices, refuses to write a short or empty result, and does nothing when the numbers have not moved.',
    ],
  },
  {
    title: 'Search, sharing and mobile',
    notes: [
      'Canonical link, social cards, structured data, robots and sitemap, plus a crawler-readable description of the stages.',
      'The 3D stages pause when scrolled away or the tab is hidden.',
      'Mobile: payline markers on every column, not just the first.',
    ],
  },
  {
    title: 'Stages three, six and seven added',
    notes: [
      'Dice for the loadout and attachment budgets.',
      'A fan of keycards drawn face down from the locked rooms on the map in force.',
      'A bamboo stick cup for squad size.',
    ],
  },
  {
    title: 'First two stages built',
    notes: [
      'A roulette wheel for difficulty, paying out a token you drag to the slot.',
      'A seven-column slot machine for the kit, with per-column hold and re-spin, and rarer items spinning longer.',
      'Every stage seeded, so a shared link replays the same run.',
    ],
  },
];
