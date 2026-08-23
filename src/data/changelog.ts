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
    title: 'Operator portraits',
    notes: [
      'Thirteen of the sixteen operators now have their portrait in the reel, supplied by hand rather than downloaded. Vlinder, N-Two and Morse still read as their name.',
      'These are committed to the project instead of mirrored, so they are there on a fresh clone with nothing to run first. A second list, tools/gear-local.json, marks which ones those are, and the set the app draws from is generated from both lists rather than kept by hand — the two drifting apart is what puts a 404 in the console for every cell.',
      'A cell whose picture will not load now puts the name back instead of going blank. It used to hide the broken image and leave nothing at all, which looked worse than the text it had replaced.',
      'The build ends by saying how many pictures are missing and what to run, so a picture-less build cannot be deployed by accident.',
    ],
  },
  {
    title: 'Tiers named by their colour',
    notes: [
      'A tier is called by its colour now — gray, green, blue, purple, gold, red — everywhere one is written: the note under a reel item, the bounds above each column, the keycard faces, the round under the ammunition wheel and the preset descriptions. The ladder was already colour-coded on every surface, so the label and the thing it labels finally say the same word. The word for the ladder itself is still Tier.',
      'Nothing about the filtering changed — the bounds still compare the same 1-6 numbers underneath.',
      'The ammunition wheel says plainly that it does not check the round against your gun yet, in the same place the capsule machine admits the same thing about attachments.',
      'A second picture source was tried for the entries that have no artwork, and taken back out: its files would not download. Coverage stays at 124, and the rest of the entries read as their name.',
    ],
  },
  {
    title: 'Pictures only in the strip, and no prices',
    notes: [
      'A reel cell with a picture is now just the picture, filling the cell. The name under the window is the one that counts; a name in every cell competed with it and made a spin read as a list scrolling past. Cells with no picture published still carry their name.',
      'Prices are no longer shown anywhere — not on the attachment cards, not in the parts list, not under a round. The figures are still collected, but they go stale between patches and nothing here reconciles them.',
      'The roulette wheel got the same green table as the other stages, cloth only — the bowl already has its own rim.',
      'Fixed the payline: the tier bounds moved above the columns and the green line did not follow, so it had been sitting a block high.',
    ],
  },
  {
    title: 'Icons on the slot machine',
    notes: [
      'Guns, helmets, vests, chest rigs and backpacks now show their own artwork in the reel cells, beside the name rather than above it — a column is twice as wide as a cell is tall, so the room a picture can have is horizontal.',
      '124 of the 159 entries have one. The rest are newer guns and a handful of gear no source publishes a picture for; those cells read as they always did.',
      'Mirrored into public/gear/ like the rest of the art, so nothing is fetched from anyone else at runtime. npm run icons fills all three sets.',
      'Maps and operators have no published icons anywhere, so those two columns stay text.',
    ],
  },
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
    title: 'Tier colour unified',
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
