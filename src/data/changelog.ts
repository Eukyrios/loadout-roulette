/**
 * The build log, newest first.
 *
 * Ordered rather than dated: this was built in a run of sessions rather than
 * on a release schedule, and a made-up date on every entry would be worse than
 * none. Each entry is one round of work, and `notes` says what actually
 * changed — including the things that were wrong and got fixed, because a log
 * that only lists wins is not much of a log.
 *
 * Where data comes from, it comes from external data sources: public community
 * databases for this game. They are not named here, and the app never talks to
 * them at runtime — every picture is mirrored into this repo first.
 */

export interface LogEntry {
  /** Short title for the round of work. */
  title: string;
  /** One line on what it was about. */
  summary: string;
  notes: string[];
}

export const CHANGELOG: LogEntry[] = [
  {
    title: 'The scaling bug behind every "not centred" report',
    summary: 'One missing pair of CSS lines was blowing the wheel up to twice its panel.',
    notes: [
      'The wheel canvas had no CSS size set, so the browser laid it out at its BUFFER size — which is the device pixel ratio times the intended size. On any display scaled above 1x that is a canvas twice as wide as its panel, clipped to the top-left corner. Every other stage sets those two lines; this one had missed them.',
      'It hid for a long time because a 1x test display makes buffer and layout size identical, so measurements kept coming back clean while the thing was visibly broken on real screens. Now measured at 1x, 2x and 3x across eight window shapes: horizontal centre 0.499-0.500 every time, nothing clipped anywhere.',
      'The wheel reads as an object again — a deeper drum, a heavier brass rim with pegs on it, a domed hub cap, and the camera tilted back like the other stages.',
      'No pictures on the wedges. At six to a wheel there was no room for a picture and a name that could be read; the name won, and the round\u2019s artwork sits on the card beside the wheel.',
      'The build log moved below the settings panel and starts collapsed.',
    ],
  },
  {
    title: 'A wheel instead of a dart, and one palette everywhere',
    summary: 'Stage five spins now, and a grade is the same colour wherever it appears.',
    notes: [
      'The dart board is a prize wheel: six rounds round the rim, a fixed pawl at twelve o’clock, spin it and it slows onto one. A dart lands wherever it lands and the camera has to chase it, which is what kept knocking the shot off centre; a wheel spins in place, so the frame never moves.',
      'No camera movement at all now — the framing box is a square on the hub, computed once per resize and never touched by the animation.',
      'The badge in the middle of the wheel is gone. The panel beside it already says what the stage is.',
      'Wedges are painted with their grade colour and nothing else. Alternate wedges used to be knocked back 22% to separate neighbours, which made two Epics look like two different rarities. A thin dark separator does that job instead, so gold here is the same gold as a gold reel and a gold keycard.',
    ],
  },
  {
    title: 'Ammunition pictures, and no outside requests',
    summary: 'The round art finally shows up, and the app stops asking anyone else for it.',
    notes: [
      'Every item picture — attachments and ammunition — is now mirrored into the repo and loaded from there. Linking to them directly looked fine in testing and did not work in practice: the pictures simply never arrived, which is what a refused hotlink looks like.',
      'Because they are same-origin now, round pictures can be drawn straight onto the dart board itself. A round with no mirrored picture gets a drawn cartridge in its grade colour instead of an empty wedge.',
      'One command fills the mirror: npm run icons. Until it is run, glyphs and cartridges stand in — that is a designed fallback, not a broken state.',
      'No external host appears anywhere in the shipped app any more. The upstream URLs live in two build-time files the browser never sees.',
      'The roulette wheel was cropping its own rim at the top on narrow-but-short panels. Measured across seven widths: it filled 97% of the canvas height between roughly 560 and 820 pixels of page width and lost the top of the bowl. Fixed, and re-measured clean everywhere.',
      'Stage five no longer checks whether a round fits your gun — six rounds are drawn from the whole catalogue. The caliber data is still there for when that comes back.',
    ],
  },
  {
    title: 'Stage five boarded up, then reopened',
    summary: 'The dart board went behind an under-construction notice while its framing and pictures were sorted out.',
    notes: [
      'Rather than ship a stage that half worked, it was switched off behind a notice with one flag, leaving everything behind it building and running.',
    ],
  },
  {
    title: 'A better dart, and a board that sits still',
    summary: 'The dart was rebuilt as a real turned profile and the board stopped drifting in its panel.',
    notes: [
      'The dart is a lathed profile now — needle point, a barrel that swells forward of centre, knurl rings, a waisted shaft and four kite flights — instead of a stack of cylinders.',
      'It had been almost invisible, and not for the reason it looked: the whole dart was buried behind the board with a fraction of an inch poking out. Aiming an object at a point turns its front face toward the target, and the dart had been built facing the other way, so it drove itself through the board.',
      'The framing box ran deeper on one side than the other. With a tilted camera that pushes the centre of the box off the face of the board and rides the whole thing up the canvas. Made symmetric; the board now sits dead centre, measured on the rendered pixels rather than judged by eye.',
    ],
  },
  {
    title: 'Rarity colours everywhere',
    summary: 'Keycards and ammunition are graded on the same 1-6 ladder the reels use.',
    notes: [
      'One palette in one file, matching the reels: grey, green, blue, purple, gold, red.',
      'Keycards carry their grade on the header band, the border and a wash up the face. All 59 cards across the four mapped locations are graded; the tiered access cards are not graded anywhere, so they stay plain rather than being given a colour they have not earned.',
      'Ammunition grades were checked rather than assumed. For penetration levels 1-6 the grade is the level — but the expanding rounds at level 0 are graded 3, not 1, and one of them is graded 2. The first pass had guessed them all at the bottom of the ladder and was wrong.',
    ],
  },
  {
    title: 'Stage five: throw a dart for your ammunition',
    summary: 'A dart board that picks a round, with the full ammunition catalogue behind it.',
    notes: [
      'Ammunition data collected for twenty calibers: names, penetration levels and prices where they are published.',
      'Seven calibers belong to guns the fuller source has no entry for at all. Their round names were found elsewhere and are labelled as partial rather than padded out with invented figures.',
      'Every weapon in the app is mapped to the caliber it chambers.',
    ],
  },
  {
    title: 'Attachment pictures and a work-in-progress notice',
    summary: 'Real artwork on the capsule cards, and an honest note about what the stage does not do.',
    notes: [
      'Capsule cards were raised in frame and reshaped to portrait so the artwork has room.',
      'A notice on the stage says plainly that attachment compatibility is not implemented — nobody publishes which attachments fit which gun, so the machine is honestly random rather than quietly wrong.',
    ],
  },
  {
    title: 'The capsule machine',
    summary: 'A gashapon machine that shakes, drops a capsule and opens it onto five attachment cards.',
    notes: [
      'Globe shakes, capsule drops through a chute, bounces into the tray, rises and unclips at the seam in a burst of sparks.',
      'Capsules stopped escaping the dome: the containment was hand-tuned radii that ignored the sphere’s curvature. Replaced with arithmetic, re-applied every frame.',
      'Five cards, hard-capped. Twenty had once ended up on screen because a second pull cleared an empty table while the first was still loading its pictures.',
      '414 attachments collected, with stat lines and prices.',
    ],
  },
  {
    title: 'Prices, once a day',
    summary: 'A scheduled job pulls current market prices instead of shipping a stale snapshot.',
    notes: [
      'Runs daily, refuses to write a short or empty result, and does nothing at all when the numbers have not moved.',
    ],
  },
  {
    title: 'Search, sharing and mobile',
    summary: 'The page can be found, shared and used on a phone.',
    notes: [
      'Canonical link, social cards, structured data, robots and sitemap.',
      'A crawler-readable description of the stages behind the interactive page.',
      'Mobile: the payline arrows and band appear on every column, not just the first.',
      'Mobile lag traced to the 3D stages rendering while off screen. They now pause when scrolled away or the tab is hidden, and wake on the way back.',
    ],
  },
  {
    title: 'Stages three and four: dice, cards and sticks',
    summary: 'Spending caps, keycards and squad size, each with its own physical prop.',
    notes: [
      'Dice for the loadout and attachment budgets.',
      'A fan of keycards drawn face down from the locked rooms on the map you rolled.',
      'A bamboo stick cup for squad size.',
    ],
  },
  {
    title: 'The slot machine',
    summary: 'Pull the lever for your kit: map, operator, weapon, helmet, vest, rig and pack.',
    notes: [
      'Reels run strictly one at a time, left to right, and rarer items spin longer.',
      'Per-column hold and re-spin. The token is an unlock, not a fare — once it is in, pulls are unlimited.',
      'Everything is filtered to what the rolled difficulty actually allows.',
    ],
  },
  {
    title: 'The roulette wheel',
    summary: 'Where it starts: spin for a difficulty and take the token.',
    notes: [
      'Red is Easy, black Normal, green Hard, built from the pocket list so changing it changes the odds too.',
      'The spin is choreographed rather than simulated, so a shared link replays exactly the same run.',
      'The token can be dragged to the slot; pushing it at the top or bottom of the window scrolls the page instead of fighting the edge.',
    ],
  },
];
