/**
 * What the app can do, newest first.
 *
 * A feature list, not a work diary: each entry is one thing you can use, said
 * once. Fixes and false starts are not in here — nobody needs a paragraph
 * about something that never shipped.
 *
 * Ordered rather than dated. This was built in a run of sessions rather than
 * on a release schedule, and a made-up date on every entry would be worse than
 * no date at all.
 *
 * Game data comes from external data sources: public community databases for
 * this game. They are not named here, and the app never talks to them while
 * you use it — every picture is mirrored into the project first.
 */

export interface LogEntry {
  /** Short title for the feature. */
  title: string;
  /** One line on what it is. */
  summary: string;
  notes: string[];
}

export const CHANGELOG: LogEntry[] = [
  {
    title: 'Play the stages in any order',
    summary: 'Every stage that needs an earlier result lets you set it by hand.',
    notes: [
      'A box on each dependent stage shows what it is working from — Difficulty, Weapon, Caliber, Map — and reads "None" when nothing is. Click it and type: it filters as you go and ignores punctuation, so "762x39" finds 7.62x39mm.',
      'Hand-set values are flagged so they are never mistaken for a roll, and clear back to whatever was rolled.',
      'This is what makes a single stage useful on its own. If your loadout is already decided and you only want ammunition, name the caliber and spin.',
    ],
  },
  {
    title: 'Stage five: spin for ammunition',
    summary: 'A prize wheel that picks your round, and its grade.',
    notes: [
      'Six rounds round the rim, a fixed pawl at twelve o’clock. Spin it and it slows onto one.',
      'Name a caliber and the wheel becomes that caliber’s own ladder, so the spin decides which grade of a round you are already committed to. Leave it unset and it deals from every caliber in the game.',
      'Twenty calibers behind it, with penetration levels and prices where they are published. Seven belong to guns no source documents fully; those are labelled as partial rather than padded out with invented figures.',
    ],
  },
  {
    title: 'Rarity colour, everywhere it means something',
    summary: 'One 1-6 ladder across reels, keycards and ammunition.',
    notes: [
      'Grey, green, blue, purple, gold, red — the game’s own grades, held in one place, so a gold wedge on the wheel means what a gold reel means.',
      'Keycards carry their grade on the header, the border and a wash up the face. All 59 across the four mapped locations are graded; the tiered access cards are not graded anywhere, so they stay plain rather than being given a colour they have not earned.',
    ],
  },
  {
    title: 'Item pictures, served from here',
    summary: 'Attachment and ammunition art mirrored into the project.',
    notes: [
      'Every picture is a local file, so the app makes no request to anyone else while you use it, and nothing breaks the day someone else’s server changes its mind.',
      'One command fills the mirror: npm run icons. Until it is run an attachment card draws its slot glyph — a designed fallback, not a broken state.',
    ],
  },
  {
    title: 'Stage four: crank for attachments',
    summary: 'A gashapon machine that opens onto five attachment cards.',
    notes: [
      'The globe shakes, a capsule drops through the chute, bounces into the tray, floats up and unclips at its seam in a burst of sparks.',
      '414 attachments with their stat lines and prices. Fit is not checked — nobody publishes which attachments suit which gun, so the machine is honestly random rather than quietly wrong, and the stage says so.',
    ],
  },
  {
    title: 'Stage six: draw your keycards',
    summary: 'Up to five locked-room keys, taken face down.',
    notes: [
      'The deck is the real locked rooms on the map in force, so you take the card before you know the door.',
      'Maps that run generic tiered access cards instead of room keys draw from those, rather than from invented room names.',
    ],
  },
  {
    title: 'Stages three and seven: dice and sticks',
    summary: 'Spending caps, and how many of you are going in.',
    notes: [
      'Two dice for the loadout and attachment budgets.',
      'A bamboo stick cup for squad size: solo, duo or trio, an even one in three.',
    ],
  },
  {
    title: 'Stage two: pull for your kit',
    summary: 'Map, operator, weapon, helmet, vest, rig and pack.',
    notes: [
      'Reels run one at a time, left to right, and rarer items spin longer.',
      'Hold and re-spin any column on its own. The token is an unlock, not a fare — once it is in, pulls are unlimited.',
      'Everything is filtered to what the difficulty in force allows, with presets and per-slot tier bounds in the settings panel.',
    ],
  },
  {
    title: 'Stage one: spin for difficulty',
    summary: 'Red for Easy, black for Normal, green for Hard — then take the token.',
    notes: [
      'Built from the pocket list, so changing the wheel changes the odds with it.',
      'The token can be dragged to the slot; pushing it at the top or bottom of the window scrolls the page rather than fighting the edge.',
    ],
  },
  {
    title: 'Prices, once a day',
    summary: 'Current market prices instead of a snapshot that ages.',
    notes: [
      'A scheduled job refreshes them daily, refuses to write a short or empty result, and does nothing at all when the numbers have not moved.',
    ],
  },
  {
    title: 'Shareable, findable, and usable on a phone',
    summary: 'A seeded link replays the same run, and the whole thing works one-handed.',
    notes: [
      'Every stage is seeded, so a shared link deals the same cards, the same capsule and the same wheel.',
      'Search metadata, social cards, and a crawler-readable description of the stages.',
      'The 3D stages pause when scrolled away or the tab is hidden, so a phone is not rendering seven canvases it cannot see.',
    ],
  },
];
