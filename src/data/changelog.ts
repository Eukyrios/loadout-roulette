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
    title: 'Tighter stages, and a picture filter',
    notes: [
      'Every stage except the slot machine is about a third quicker at its written length \u2014 the reels were the one that read right, and the rest were pacing themselves against nothing. The wheel, the dice, the cards, the cup, the capsule machine and the ammunition wheel all came down together, so the slider still moves them all in step.',
      'The Length slider starts at 2x now instead of 2.5x, for everyone. It briefly picked a shorter default on machines asking for less motion, which meant two people got different pacing out of the same build with nothing on screen to say why. The Animation switch beside it is the honest place for that.',
      'A filter in the machine settings: only deal items that have a picture. On by default \u2014 it costs 13 entries of 183, and a reel of nothing but artwork is worth that while the last of the gear waits for its item card. Turn it off to put the name-only cells back; they are a designed fallback, not damage.',
    ],
  },
  {
    title: 'A length control, and a longer default',
    notes: [
      'The bottom bar has a Length slider beside the volume: 0.5x to 5x, remembered across visits, greyed out when animation is off because there is nothing left to stretch. It multiplies TIME, so higher is longer, not faster.',
      'Everything runs at 2.5x its written length by default. A reel used to be over almost as it started; a roll is worth more when you have to wait for it. Drag it down to 0.5x for a quick one.',
      'A longer setting is more items flying past, not the same handful crawling \u2014 the strip travels further to fill the extra time, so its own pace holds at roughly the same speed whatever the slider says.',
      'Rarity multiplies on top and is back to a clean three: a red reel runs three times a gray and travels three times as far, at every setting. That had quietly stopped showing, because the strip length was worked out AFTER the speed was applied and kept bottoming out on its floor \u2014 so a red and a gray covered identical ground and the red merely crawled.',
      'Four stages ignored the slider until a reload \u2014 the roulette wheel, the dice, the keycards and the stick cup each measured their length once when their scene was built, and a scene is built once for the life of the page. They read it as each sequence starts now.',
      'The roulette camera was the one part that stayed on real seconds, and the ball waits for it before it goes \u2014 so every spin carried a fixed prefix that the slider could not touch, which at a short setting was a third of the stage. It scales with everything else now.',
      'A system setting for less motion no longer overrules any of it. It was clamping every length to 0.385 \u2014 below the slider\u2019s own minimum \u2014 so on a machine with that preference on, the control could not move anything and rarity could not either: a red and a gray came out the same. The preference picks where the slider starts now, and Animation off is still one button along for anyone who wants none at all.',
    ],
  },
  {
    title: 'Every weapon has its picture',
    notes: [
      'All 66 guns now show their own artwork, cut from item cards. So does the Nylon Chest Rig, which was not in the catalogue at all \u2014 and the .357 Revolver, whose download had quietly failed months ago.',
      'The cut-outs were redone with a better matte. The first pass trimmed the card down to a fixed window before cutting, which sliced the bottom off every pistol grip, and left a slab of card behind the bow and the revolver. It now reads the whole card and drops the leftover furniture afterwards by discarding every island that is not the weapon.',
      'Nine rounds of ammunition were on the market and not in the data, including three arrows \u2014 so the Compound Bow chambers a caliber now instead of nothing.',
      'Ammunition grades were checked against the market rather than trusted: the rarity on every round already recorded came back exactly right, pen-0 oddities included.',
    ],
  },
  {
    title: 'The reels behave while they turn',
    notes: [
      'A column takes the colour of whatever is crossing its window mid-spin, instead of staying grey until it stops. It gives nothing away \u2014 until the reel halts, the colour showing belongs to some other item \u2014 and the machine stops looking inert while a hundred things fly past.',
      'A reel no longer reshuffles itself after landing. The two items either side of the winner used to be random until the moment it stopped, then swap for the real neighbours a beat later, which read as the machine changing its mind. They are now seated around the winner before the strip even starts moving.',
    ],
  },
  {
    title: 'Maps and operators, both complete',
    notes: [
      'All sixteen operators and all seven maps now carry a picture. Those two columns had never had one.',
      'The last three portraits arrived as screenshots on a card, so they were cut off their backgrounds, matted, and squared to the framing the other thirteen already shared \u2014 head at the same scale, shoulders leaving at the bottom edge.',
      'Five map icons came off the world map screen. AZ3 was not among them and was cut from a video frame instead, at the framing the other five share: the same square, the same drop below the label, found by matching the supplied crops back against the frame rather than by eye.',
      'Zero Dam at night has no marker of its own \u2014 it is the same dam after dark \u2014 so its icon is the day one graded down. Deliberate, and the one picture here that is not straight from the game.',
      'Coverage is 147 of 182. What is left is guns and gear nobody publishes art for.',
    ],
  },
  {
    title: 'Why no picture ever appeared',
    notes: [
      'Two faults, both real, neither of them the artwork. First: a reel picture was sized from its own dimensions, which an image does not have until it has loaded — so it laid out at zero by zero, never counted as near the viewport, and was never requested. Not a failed request; no request. It now fills the cell and letterboxes inside it, so the box exists from the first layout.',
      'Second: the pictures were press-kit sized. The M4A1 render is 2000 by 1000 and 846 KB to fill a box 120 wide; a screenful came to about fifteen megabytes. npm run icons now shrinks everything it downloads to twice the size it is drawn at — the same four files went from 2.4 MB to 82 KB with no visible difference.',
      'A cell whose picture genuinely will not load falls back to the name rather than sitting empty.',
    ],
  },
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
