/**
 * ============================================================================
 *  GAME DATA — Delta Force (Hawk Ops), Operations mode
 * ============================================================================
 *
 *  This is the ONLY file you need to touch to keep the tool current.
 *  Researched against official Garena patch notes + community wikis,
 *  accurate to Season 10 "Meltdown" (Aug 2026). Notes on lower-confidence
 *  entries are marked with `TODO:` comments.
 *
 *  To support a different game entirely, write a sibling file exporting the
 *  same shape and swap the import in `src/data/slots.ts`.
 */

import type { Entry } from './types';

/* -------------------------------------------------------------------------- */
/*  Operators                                                                  */
/* -------------------------------------------------------------------------- */

export const OPERATOR_CLASSES = ['Assault', 'Support', 'Engineer', 'Recon'] as const;

export const OPERATORS: Entry[] = [
  { id: 'd-wolf', name: 'D-Wolf', note: 'Exoskeleton sprint burst', attrs: { class: 'Assault' } },
  { id: 'vyron', name: 'Vyron', note: 'Air-launcher knockdown + dash', attrs: { class: 'Assault' } },
  { id: 'nox', name: 'Nox', note: 'Bladed disc drone, stealth approach', attrs: { class: 'Assault' } },
  { id: 'tempest', name: 'Tempest', note: 'Recall anchor + self-revive', attrs: { class: 'Assault' } },

  { id: 'stinger', name: 'Stinger', note: 'Healing darts, smokescreen UAV', attrs: { class: 'Support' } },
  { id: 'toxik', name: 'Toxik', note: 'HP-draining swarm, ally boost', attrs: { class: 'Support' } },
  { id: 'vlinder', name: 'Vlinder', note: 'Rescue drone swarm, remote revive', attrs: { class: 'Support' } },

  { id: 'shepherd', name: 'Shepherd', note: 'Sonic paralysis drone + traps', attrs: { class: 'Engineer' } },
  { id: 'uluru', name: 'Uluru', note: 'Loitering munition, quickset cover', attrs: { class: 'Engineer' } },
  { id: 'sineva', name: 'Sineva', note: 'Blast shield, grapple gun', attrs: { class: 'Engineer' } },
  { id: 'gizmo', name: 'Gizmo', note: 'Net turret + corroding crawlers', attrs: { class: 'Engineer' } },
  { id: 'n-two', name: 'N-Two', note: 'Cryo launcher, homing stun', attrs: { class: 'Engineer' } },

  { id: 'luna', name: 'Luna', note: 'Detection arrows, volt field', attrs: { class: 'Recon' } },
  { id: 'hackclaw', name: 'Hackclaw', note: 'Signal decoder, data knife', attrs: { class: 'Recon' } },
  { id: 'raptor', name: 'Raptor', note: 'Pilotable marking drone', attrs: { class: 'Recon' } },
  { id: 'morse', name: 'Morse', note: 'Sonar sweep, throwable jammer', attrs: { class: 'Recon' } },
];

/* -------------------------------------------------------------------------- */
/*  Raid modes                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The mode reel rolls first and gates the map reel — only maps that actually
 * offer the rolled tier can come up. See `MAPS[].attrs.modes` below.
 */
export const MODES: Entry[] = [
  { id: 'easy', name: 'Easy', note: 'Helmet & vest Tier 4 max', attrs: { color: 'red' } },
  { id: 'normal', name: 'Normal', note: 'No tier caps · kit value floor', attrs: { color: 'black' } },
  { id: 'hard', name: 'Hard', note: 'No tier caps · steep value floor', attrs: { color: 'green' } },
];

/**
 * MAXIMUM gear tier allowed per slot, per difficulty. Anything absent is
 * uncapped.
 *
 * Easy is hard-blocked at the deploy screen: the client refuses to launch with
 * a helmet or ballistic vest above Tier 4 (it also caps ammo at Tier 3, which
 * this tool does not model). Chest rigs and backpacks are NOT named in that
 * restriction and appear to be uncapped, so they are left unfiltered rather
 * than guessed at.
 *
 * Normal and Hard impose no tier ceiling at all. Their gate runs the other
 * way — a MINIMUM total kit value you must be carrying to queue. See
 * ACCESS_VALUE below.
 */
export const MODE_GEAR_CAPS: Record<string, Record<string, number>> = {
  easy: { helmet: 4, vest: 4 },
  normal: {},
  hard: {},
};

/**
 * Minimum kit value ("access value") in Tekniq Alloy needed to queue, by
 * difficulty then map. This is a floor you must meet, not a fee — nothing is
 * deducted. Informational here: the tool has no per-item prices, so it cannot
 * enforce it.
 *
 * Hard-tier figures come from community calculators rather than an official
 * English source; treat them as approximate.
 */
export const ACCESS_VALUE: Record<string, Record<string, number>> = {
  easy: {},
  normal: {
    'zero-dam': 112_500,
    'zero-dam-night': 187_500,
    'layali-grove': 112_500,
    az3: 112_500,
    brakkesh: 187_500,
    'space-city': 187_500,
  },
  hard: {
    brakkesh: 550_000,
    'space-city': 600_000,
    'tide-prison': 780_000,
  },
};

export const MODE_BY_ID = Object.fromEntries(MODES.map((mode) => [mode.id, mode]));

/**
 * The roulette wheel, pocket by pocket, clockwise from the 12 o'clock mark.
 *
 * The colour mix IS the probability model — there is no separate weighting.
 * Greens are the rare pockets, so Hard comes up about 11% of the time. Change
 * the distribution here and the odds change with it; the wheel is built from
 * this array at runtime, so any length works.
 */
export const WHEEL_POCKETS: string[] = Array.from({ length: 27 }, (_, i) => {
  if (i % 9 === 0) return 'hard'; // 3 green pockets, evenly spaced
  return i % 2 === 0 ? 'easy' : 'normal';
});

export const POCKET_COLORS: Record<string, number> = {
  easy: 0xc0392b, // red
  // Not true black: against a dark bowl under dim lighting, #14181f pockets
  // disappear entirely and the wheel reads as red-and-green only.
  normal: 0x2f3742, // black
  hard: 0x1f9d55, // green
};

/* -------------------------------------------------------------------------- */
/*  Maps                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * `attrs.modes` is a comma-separated list of MODES ids the map supports. It
 * lists the tiers that *exist* for a map, not what is playable right now —
 * Operations runs a rotation and only a subset is permanent.
 */
const m = (id: string, name: string, modes: string): Entry => ({
  id,
  name,
  note: modes
    .split(',')
    .map((k) => MODES.find((mode) => mode.id === k)?.name ?? k)
    .join(' / '),
  // `name` is duplicated into attrs so the map picker can filter on it with
  // the same multi-select machinery every other slot uses.
  attrs: { modes, name },
});

export const MAPS: Entry[] = [
  m('zero-dam', 'Zero Dam', 'easy,normal'),
  // Night runs its own three tiers: Dusk carries the Easy restrictions, while
  // Long Night and Ever Night behave like Normal. None of them is a Hard tier.
  m('zero-dam-night', 'Zero Dam — Night', 'easy,normal'),
  m('layali-grove', 'Layali Grove', 'easy,normal'),
  m('brakkesh', 'Brakkesh', 'normal,hard'),
  m('space-city', 'Space City', 'normal,hard'),
  // Hard only — Tide Prison has no Easy or Normal variant.
  m('tide-prison', 'Tide Prison', 'hard'),
  // Hard was not in the game at S10 launch; CN notes say it is planned.
  m('az3', 'AZ3 Nuclear Power Plant', 'easy,normal'),
];

/* -------------------------------------------------------------------------- */
/*  Weapons                                                                    */
/* -------------------------------------------------------------------------- */

export const WEAPON_CLASSES = [
  'Assault Rifle',
  'SMG',
  'Marksman Rifle',
  'Sniper Rifle',
  'Light Machinegun',
  'Shotgun',
  'Special',
  'Pistol',
] as const;

const w = (id: string, name: string, cls: string): Entry => ({ id, name, note: cls, attrs: { class: cls } });

export const WEAPONS: Entry[] = [
  // Assault Rifles
  // TODO: the game may split G3 / M7 / SCAR-H / ASh-12 / RM277 into a separate
  // "Battle Rifle" tab. Retag their class here if so, and add it to
  // WEAPON_CLASSES above — the filter UI picks it up automatically.
  w('car-15', 'CAR-15', 'Assault Rifle'),
  w('m16a4', 'M16A4', 'Assault Rifle'),
  w('m4a1', 'M4A1', 'Assault Rifle'),
  w('ak-12', 'AK-12', 'Assault Rifle'),
  w('akm', 'AKM', 'Assault Rifle'),
  w('aks-74', 'AKS-74', 'Assault Rifle'),
  w('qbz95-1', 'QBZ95-1', 'Assault Rifle'),
  w('k416', 'K416', 'Assault Rifle'),
  w('k437', 'K437', 'Assault Rifle'),
  w('kc17', 'KC17', 'Assault Rifle'),
  w('ci-19', 'CI-19', 'Assault Rifle'),
  w('ptr-32', 'PTR-32', 'Assault Rifle'),
  w('as-val', 'AS VAL', 'Assault Rifle'),
  w('aug', 'AUG', 'Assault Rifle'),
  w('sg552', 'SG552', 'Assault Rifle'),
  w('mk47', 'MK47', 'Assault Rifle'),
  w('mcx-lt', 'MCX LT', 'Assault Rifle'),
  w('ar-57', 'AR-57', 'Assault Rifle'),
  w('rm277', 'RM277', 'Assault Rifle'),
  w('g3', 'G3', 'Assault Rifle'),
  w('m7', 'M7', 'Assault Rifle'),
  w('scar-h', 'SCAR-H', 'Assault Rifle'),
  w('ash-12', 'ASh-12', 'Assault Rifle'),

  // SMGs
  w('uzi', 'UZI', 'SMG'),
  w('bizon', 'Bizon', 'SMG'),
  w('smg-45', 'SMG-45', 'SMG'),
  w('mp7', 'MP7', 'SMG'),
  w('mp5', 'MP5', 'SMG'),
  w('p90', 'P90', 'SMG'),
  w('sr-3m', 'SR-3M', 'SMG'),
  w('vityaz', 'Vityaz', 'SMG'),
  w('vector', 'Vector', 'SMG'),
  w('qcq-171', 'QCQ-171', 'SMG'),
  w('mk4', 'MK4', 'SMG'),

  // Marksman Rifles
  w('mini-14', 'Mini-14', 'Marksman Rifle'),
  w('m14', 'M14', 'Marksman Rifle'),
  w('sks', 'SKS', 'Marksman Rifle'),
  w('svd', 'SVD', 'Marksman Rifle'),
  w('vss', 'VSS', 'Marksman Rifle'),
  w('sr-25', 'SR-25', 'Marksman Rifle'),
  w('psg-1', 'PSG-1', 'Marksman Rifle'),
  w('sr9', 'SR9', 'Marksman Rifle'),
  w('svch', 'SVCH', 'Marksman Rifle'),
  w('marlin', 'Marlin Lever-action', 'Marksman Rifle'),

  // Sniper Rifles
  w('sv-98', 'SV-98', 'Sniper Rifle'),
  w('r93', 'R93', 'Sniper Rifle'),
  w('m700', 'M700', 'Sniper Rifle'),
  w('awm', 'AWM', 'Sniper Rifle'),
  w('m82', 'M82', 'Sniper Rifle'),

  // LMGs
  w('m249', 'M249', 'Light Machinegun'),
  w('pkm', 'PKM', 'Light Machinegun'),
  w('m250', 'M250', 'Light Machinegun'),
  w('qjb201', 'QJB201', 'Light Machinegun'),

  // Shotguns
  w('m870', 'M870', 'Shotgun'),
  w('m1014', 'M1014', 'Shotgun'),
  w('s12k', 'S12K', 'Shotgun'),
  w('725', '725', 'Shotgun'),
  w('fs-12', 'FS-12', 'Shotgun'),

  // Special
  w('compound-bow', 'Compound Bow', 'Special'),

  // Pistols
  w('g17', 'G17', 'Pistol'),
  w('g18', 'G18', 'Pistol'),
  w('93r', '93R', 'Pistol'),
  w('qsz-92g', 'QSZ-92G', 'Pistol'),
  w('desert-eagle', 'Desert Eagle', 'Pistol'),
  w('357-revolver', '.357 Revolver', 'Pistol'),
  w('m1911', 'M1911', 'Pistol'),
];

/* -------------------------------------------------------------------------- */
/*  Armor & carry gear                                                         */
/* -------------------------------------------------------------------------- */

export const TIER_MIN = 1;
export const TIER_MAX = 6;

const g = (id: string, name: string, tier: number): Entry => ({
  id,
  name,
  note: `Tier ${tier}`,
  attrs: { tier },
});

export const HELMETS: Entry[] = [
  g('steel-helmet', 'Steel Helmet', 1),
  g('security-helmet', 'Security Helmet', 1),
  g('boonie-hat', 'Boonie Hat', 1),
  g('outdoor-baseball-cap', 'Outdoor Baseball Cap', 1),
  g('retro-motorcycle-helmet', 'Retro Motorcycle Helmet', 2),
  g('h01-tactical-helmet', 'H01 Tactical Helmet', 2),
  g('dro-tactical-helmet', 'DRO Tactical Helmet', 2),
  g('mc-helmet', 'MC Helmet', 2),
  g('anti-riot-helmet', 'Anti-Riot Helmet', 3),
  g('h07-tactical-helmet', 'H07 Tactical Helmet', 3),
  g('das-helmet', 'DAS Helmet', 3),
  g('mc201-helmet', 'MC201 Helmet', 3),
  g('d6-tactical-helmet', 'D6 Tactical Helmet', 4),
  g('mhs-tactical-helmet', 'MHS Tactical Helmet', 4),
  g('dich-training-helmet', 'DICH Training Helmet', 4),
  g('gt1-tactical-helmet', 'GT1 Tactical Helmet', 4),
  g('mask-1-iron-helmet', 'Mask-1 Iron Helmet', 5),
  g('h09-anti-riot-helmet', 'H09 Anti-Riot Helmet', 5),
  g('dich-1-tactical-helmet', 'DICH-1 Tactical Helmet', 5),
  g('gn-heavy-helmet', 'GN Heavy Helmet', 5),
  g('h70-elite-helmet', 'H70 Elite Helmet', 6),
  g('dich-9-heavy-helmet', 'DICH-9 Heavy Helmet', 6),
  g('gt5-commander-helmet', 'GT5 Commander Helmet', 6),
];

export const VESTS: Entry[] = [
  g('motorcycle-vest', 'Motorcycle Vest', 1),
  g('security-vest', 'Security Vest', 1),
  g('nylon-vest', 'Nylon Vest', 1),
  g('light-vest', 'Light Vest', 1),
  g('basic-stab-vest', 'Basic Stab Vest', 2),
  g('ht-tactical-vest', 'HT Tactical Vest', 2),
  g('tg-tactical-vest', 'TG Tactical Vest', 2),
  g('universal-tactical-vest', 'Universal Tactical Vest', 2),
  g('standard-issue-vest', 'Standard Issue Vest', 3),
  g('hvk-qr-vest', 'Hvk QR Vest', 3),
  g('tg-h-vest', 'TG-H Vest', 3),
  g('marksman-tac-vest', 'Marksman TAC Vest', 3),
  g('warrior-vest', 'Warrior Vest', 4),
  g('assault-vest', 'Assault Vest', 4),
  g('dt-avs-vest', 'DT-AVS Vest', 4),
  g('mk-2-tactical-vest', 'MK-2 Tactical Vest', 4),
  g('hmp-special-ops-vest', 'HMP Special Ops Vest', 4),
  g('elite-vest', 'Elite Vest', 5),
  g('hvk-2-vest', 'Hvk-2 Vest', 5),
  g('fs-composite-vest', 'FS Composite Vest', 5),
  g('heavy-assault-vest', 'Heavy Assault Vest', 5),
  g('adamantine-vest', 'Adamantine Vest', 6),
  g('ha-2-ballistic-vest', 'HA-2 Ballistic Vest', 6),
  g('trek-mas20-vest', 'Trek MAS2.0 Vest', 6),
  g('titan-vest', 'Titan Vest', 6),
];

/** Note: chest rigs genuinely cap at Tier 5 — this is not missing data. */
export const RIGS: Entry[] = [
  g('portable-chest-rig', 'Portable Chest Rig', 1),
  g('quick-recon-chest-rig', 'Quick Recon Chest Rig', 1),
  g('light-tactical-chest-rig', 'Light Tactical Chest Rig', 1),
  g('basic-chest-rig', 'Basic Chest Rig', 1),
  g('nylon-sling-bag', 'Nylon Sling Bag', 2),
  g('hk3-portable-chest-rig', 'HK3 Portable Chest Rig', 2),
  g('d01-light-chest-rig', 'D01 Light Chest Rig', 2),
  g('universal-tactical-chest-rig', 'Universal Tactical Chest Rig', 2),
  g('basic-portable-chest-rig', 'Basic Portable Chest Rig', 3),
  g('hd3-tactical-chest-rig', 'HD3 Tactical Chest Rig', 3),
  g('dsa-tactical-chest-rig', 'DSA Tactical Chest Rig', 3),
  g('g01-tactical-chest-rig', 'G01 Tactical Chest Rig', 3),
  g('assault-tactical-vest', 'Assault Tactical Vest', 4),
  g('raider-tactical-vest', 'Raider Tactical Vest', 4),
  g('drc-advanced-recon-chest-rig', 'DRC Advanced Recon Chest Rig', 4),
  g('gir-field-chest-rig', 'GIR Field Chest Rig', 4),
  g('hurricane-tactical-chest-rig', 'Hurricane Tactical Chest Rig', 5),
  g('black-hawk-field-chest-rig', 'Black Hawk Field Chest Rig', 5),
  g('dar-assault-chest-rig', 'DAR Assault Chest Rig', 5),
];

export const BACKPACKS: Entry[] = [
  g('sling-bag', 'Sling Bag', 1),
  g('sports-backpack', 'Sports Backpack', 1),
  g('travel-backpack', 'Travel Backpack', 1),
  g('dg-sports-backpack', 'DG Sports Backpack', 1),
  g('rucksack', 'Rucksack', 1),
  g('light-outdoor-backpack', 'Light Outdoor Backpack', 2),
  g('tactical-qr-backpack', 'Tactical QR Backpack', 2),
  g('assault-tactical-backpack', 'Assault Tactical Backpack', 2),
  g('camping-backpack', 'Camping Backpack', 2),
  g('large-climbing-bag', 'Large Climbing Bag', 3),
  g('3h-tactical-backpack', '3H Tactical Backpack', 3),
  g('dash-tactical-backpack', 'DASH Tactical Backpack', 3),
  g('ga-field-backpack', 'GA Field Backpack', 3),
  g('rainforest-hunter-backpack', 'Rainforest Hunter Backpack', 3),
  g('map-recon-backpack', 'MAP Recon Backpack', 4),
  g('field-hiking-backpack', 'Field Hiking Backpack', 4),
  g('d2-tactical-climbing-bag', 'D2 Tactical Climbing Bag', 4),
  g('gt1-outdoor-climbing-bag', 'GT1 Outdoor Climbing Bag', 4),
  g('pangolin-universal-tactical-backpack', 'Pangolin Universal Tactical Backpack', 4),
  g('als-load-system', 'ALS Load System', 5),
  g('hls-2-heavy-backpack', 'HLS-2 Heavy Backpack', 5),
  g('d3-tactical-climbing-bag', 'D3 Tactical Climbing Bag', 5),
  g('gt5-field-backpack', 'GT5 Field Backpack', 5),
  g('heavy-climbing-bag', 'Heavy Climbing Bag', 6),
  g('d7-tactical-backpack', 'D7 Tactical Backpack', 6),
  g('gto-heavy-tactical-bag', 'GTO Heavy Tactical Bag', 6),
];

/* -------------------------------------------------------------------------- */
/*  Challenge rolls                                                            */
/* -------------------------------------------------------------------------- */

/** Self-imposed difficulty modifiers. Purely a house rule — edit freely. */
export const DIFFICULTIES: Entry[] = [
  { id: 'easy', name: 'Easy', note: 'Play it straight. No extra rules.', weight: 3 },
  { id: 'normal', name: 'Normal', note: 'Extract or it does not count.', weight: 3 },
  { id: 'hard', name: 'Hard', note: 'No teammate revives. One life each.', weight: 2 },
  { id: 'full-send', name: 'Full Send', note: 'Push every fight you hear.', weight: 2 },
  { id: 'biscuit', name: 'Risk It For The Biscuit', note: 'No healing until extraction.', weight: 1 },
];

/* -------------------------------------------------------------------------- */
/*  Dice — spending caps                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Two six-sided dice, indexed by pips (index 0 = a roll of 1). Both are Tekniq
 * Alloy caps: the white die limits what the whole kit may cost, the red die
 * limits what you may spend modding the gun.
 *
 * Low rolls are meant to hurt. A 1 on the white die is a genuine scav run.
 */
export const LOADOUT_COST_FACES: Entry[] = [
  { id: 'lc1', name: 'Scav run', note: 'Found gear only — buy nothing', attrs: { value: 0 } },
  { id: 'lc2', name: '150k', note: 'Shoestring kit', attrs: { value: 150_000 } },
  { id: 'lc3', name: '300k', note: 'Modest kit', attrs: { value: 300_000 } },
  { id: 'lc4', name: '500k', note: 'Solid kit', attrs: { value: 500_000 } },
  { id: 'lc5', name: '800k', note: 'Kitted out', attrs: { value: 800_000 } },
  { id: 'lc6', name: 'No cap', note: 'Bring whatever you like', attrs: { value: -1 } },
];

export const ATTACHMENT_COST_FACES: Entry[] = [
  { id: 'ac1', name: 'Iron sights', note: 'No attachments at all', attrs: { value: 0 } },
  { id: 'ac2', name: '50k', note: 'An optic, and that is it', attrs: { value: 50_000 } },
  { id: 'ac3', name: '100k', note: 'Budget build', attrs: { value: 100_000 } },
  { id: 'ac4', name: '200k', note: 'Comfortable build', attrs: { value: 200_000 } },
  { id: 'ac5', name: '350k', note: 'Full meta build', attrs: { value: 350_000 } },
  { id: 'ac6', name: 'No cap', note: 'Spend it all', attrs: { value: -1 } },
];
