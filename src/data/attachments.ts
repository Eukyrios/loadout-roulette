/**
 * Every attachment on deltaforcetools.gg, scraped from its wiki pages.
 *
 * 414 items across nine slot categories, with the stat lines and the midpoint
 * of the all-time price range. There is NO per-weapon compatibility data
 * anywhere — the site does not publish it and the build pages render their
 * loadouts client-side — so the dispenser deliberately ignores fit and can
 * hand you an M249 handguard for your MP5. That is a choice, not a bug.
 *
 * `img` is the picture on their CDN. Icons are served from the local mirror in
 * public/att/ first, which tools/fetch-images.mjs fills from these URLs; the
 * CDN is only the fallback, because a cross-origin image can only become a
 * WebGL texture if the host sends CORS headers, and theirs promises nothing.
 */

export interface Attachment {
  id: string;
  name: string;
  cat: string;
  /** Midpoint of the recorded low and high, in game currency. */
  price: number;
  stats: Record<string, number>;
  traits: string[];
  /** Upstream CDN picture. */
  img: string;
  wiki: string;
}

/** The nine slots, in the order the game's gunsmith lists them. */
export const ATTACH_SLOTS = [
  'muzzle',
  'barrel',
  'handguard',
  'foregrip',
  'rear grip',
  'stock',
  'mag',
  'optic',
  'functional',
] as const;

export const ATTACHMENTS: Attachment[] = [
 {
  id: "357-revolver-long-barrel",
  name: ".357 Revolver Long Barrel",
  cat: "barrel",
  price: 3182,
  stats: {
   "Range": 6,
   "Control": 6,
   "Stability": 3,
   "Handling": -5,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/357RevolverLongBarre_029b4d80.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/%2E357%20Revolver%20Long%20Barrel"
 },
 {
  id: "357-revolver-zephyr-barrel",
  name: ".357 Revolver Zephyr Barrel",
  cat: "barrel",
  price: 18676,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/357RevolverZephyrBar_ccbcb7a9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/%24%7Bpoint%7D357%20Revolver%20Zephyr%20Barrel"
 },
 {
  id: "357-revolver-zephyr-long-barrel",
  name: ".357 Revolver Zephyr Long Barrel",
  cat: "barrel",
  price: 19056,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/357RevolverZephyrLon_289b5789.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/%24%7Bpoint%7D357%20Revolver%20Zephyr%20Long%20Barrel"
 },
 {
  id: "93r-practical-heavy-barrel",
  name: "93R Practical Heavy Barrel",
  cat: "barrel",
  price: 3312,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/93RPracticalHeavyBar_4c4d0751.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/93R%20Practical%20Heavy%20Barrel"
 },
 {
  id: "93r-practical-light-barrel",
  name: "93R Practical Light Barrel",
  cat: "barrel",
  price: 2956,
  stats: {
   "Control": 2,
   "Handling": 6,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/93RPracticalLightBar_c266a01d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/93R%20Practical%20Light%20Barrel"
 },
 {
  id: "93r-practical-long-barrel",
  name: "93R Practical Long Barrel",
  cat: "barrel",
  price: 2958,
  stats: {
   "Range": 6,
   "Control": 6,
   "Stability": 3,
   "Handling": -5,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/93RPracticalLongBarr_b35263ac.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/93R%20Practical%20Long%20Barrel"
 },
 {
  id: "93r-tactical-barrel",
  name: "93R Tactical Barrel",
  cat: "barrel",
  price: 7418,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/93RTacticalBarrel_83723971.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/93R%20Tactical%20Barrel"
 },
 {
  id: "ak-12-elite-bipod-long-barrel",
  name: "AK-12 Elite Bipod Long Barrel",
  cat: "barrel",
  price: 74223,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AK12EliteBipodLongBa_992b5a7b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK-12%20Elite%20Bipod%20Long%20Barrel"
 },
 {
  id: "ak-12-frontline-long-barrel",
  name: "AK-12 Frontline Long Barrel",
  cat: "barrel",
  price: 35814,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AK12FrontlineLongBar_8dae0399.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK-12%20Frontline%20Long%20Barrel"
 },
 {
  id: "akm-beaver-barrel-combo",
  name: "AKM Beaver Barrel Combo",
  cat: "barrel",
  price: 33827,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMBeaverBarrelCombo_9408dd69.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%20Beaver%20Barrel%20Combo"
 },
 {
  id: "akm-beaver-long-barrel-combo",
  name: "AKM Beaver Long Barrel Combo",
  cat: "barrel",
  price: 38307,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMBeaverLongBarrelC_84a8b4f1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%20Beaver%20Long%20Barrel%20Combo"
 },
 {
  id: "akm-performance-barrel-combo",
  name: "AKM Performance Barrel Combo",
  cat: "barrel",
  price: 68840,
  stats: {
   "Range": 2,
   "Control": 2,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMPerformanceBarrel_ca85b4d1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%20Performance%20Barrel%20Combo"
 },
 {
  id: "akm-practical-long-barrel-combo",
  name: "AKM Practical Long Barrel Combo",
  cat: "barrel",
  price: 25891,
  stats: {
   "Range": 6,
   "Control": 6,
   "Stability": 3,
   "Handling": -5,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMPracticalLongBarr_a4be019d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%20Practical%20Long%20Barrel%20Combo"
 },
 {
  id: "akm-practical-standard-barrel-combo",
  name: "AKM Practical Standard Barrel Combo",
  cat: "barrel",
  price: 22247,
  stats: {
   "Control": 2,
   "Handling": 6,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMPracticalStandard_c92ccb5a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%20Practical%20Standard%20Barrel%20Combo"
 },
 {
  id: "akm-transcendent-long-barrel-combo",
  name: "AKM Transcendent Long Barrel Combo",
  cat: "barrel",
  price: 72861,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMTranscendentLongB_6eff30a3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%20Transcendent%20Long%20Barrel%20Combo"
 },
 {
  id: "ar-carbon-fiber-barrel-combo",
  name: "AR Carbon Fiber Barrel Combo",
  cat: "barrel",
  price: 13236,
  stats: {
   "Range": 6,
   "Control": 6,
   "Stability": 3,
   "Handling": -5,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ARCarbonFiberBarrelC_f2033749.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20Carbon%20Fiber%20Barrel%20Combo"
 },
 {
  id: "ar-gabriel-long-barrel-combo",
  name: "AR Gabriel Long Barrel Combo",
  cat: "barrel",
  price: 58003,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ARGabrielLongBarrelC_9458c480.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20Gabriel%20Long%20Barrel%20Combo"
 },
 {
  id: "ar-raid-short-barrel-combo",
  name: "AR Raid Short Barrel Combo",
  cat: "barrel",
  price: 35143,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ARRaidShortBarrelCom_4700d3a9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20Raid%20Short%20Barrel%20Combo"
 },
 {
  id: "ar-specops-integrally-suppressed-combo",
  name: "AR SpecOps Integrally Suppressed Combo",
  cat: "barrel",
  price: 70182,
  stats: {
   "Range": 4,
   "Control": 4,
   "Handling": -3,
   "Stability": -6
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/ARSpecOpsIntegrallyS_28abe982.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20SpecOps%20Integrally%20Suppressed%20Combo"
 },
 {
  id: "ar-standard-barrel-combo",
  name: "AR Standard Barrel Combo",
  cat: "barrel",
  price: 4599,
  stats: {
   "Control": 2,
   "Handling": 6,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ARStandardBarrelComb_b2ea7c77.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20Standard%20Barrel%20Combo"
 },
 {
  id: "ar-trench-standard-barrel-combo",
  name: "AR Trench Standard Barrel Combo",
  cat: "barrel",
  price: 90516,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ARTrenchStandardBarr_ef83c1f7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20Trench%20Standard%20Barrel%20Combo"
 },
 {
  id: "ash-12-annihilator-precision-long-barrel",
  name: "ASh-12 Annihilator Precision Long Barrel",
  cat: "barrel",
  price: 44567,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ASh12AnnihilatorPrec_9c76f8aa.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ASh-12%20Annihilator%20Precision%20Long%20Barrel"
 },
 {
  id: "ash-12-cqb-short-barrel",
  name: "ASh-12 CQB Short Barrel",
  cat: "barrel",
  price: 39151,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ASh12CQBShortBarrel_89758547.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ASh-12%20CQB%20Short%20Barrel"
 },
 {
  id: "aug-dawn-zero-integrally-suppressed-barrel",
  name: "AUG Dawn Zero Integrally Suppressed Barrel",
  cat: "barrel",
  price: 88492,
  stats: {
   "Range": 16,
   "Control": 16,
   "Handling": -6,
   "Stability": -6
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/AUGDawnZeroIntegrall_32eae3d1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%20Dawn%20Zero%20Integrally%20Suppressed%20Barrel"
 },
 {
  id: "aug-elite-bipod-long-barrel",
  name: "AUG Elite Bipod Long Barrel",
  cat: "barrel",
  price: 81588,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AUGEliteBipodLongBar_b4b0ba6e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%20Elite%20Bipod%20Long%20Barrel"
 },
 {
  id: "aug-practical-integral-3x-scope-barrel",
  name: "AUG Practical Integral 3x Scope Barrel",
  cat: "barrel",
  price: 35662,
  stats: {
   "Range": 6,
   "Control": 6,
   "Handling": -4,
   "Accuracy": -12
  },
  traits: [
   "Integral Optic"
  ],
  img: "https://static.deltaforcetools.gg/images/AUGPracticalIntegral_d5d18dee.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%20Practical%20Integral%203x%20Scope%20Barrel"
 },
 {
  id: "aug-vanguard-standard-barrel",
  name: "AUG Vanguard Standard Barrel",
  cat: "barrel",
  price: 53276,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AUGVanguardStandardB_3d727f2a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%20Vanguard%20Standard%20Barrel"
 },
 {
  id: "awm-skyline-long-barrel",
  name: "AWM Skyline Long Barrel",
  cat: "barrel",
  price: 152157,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -4,
   "Accuracy": -8
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/AWMSkylineLongBarrel_e47136f7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AWM%20Skyline%20Long%20Barrel"
 },
 {
  id: "bizon-blade-ultra-long-barrel",
  name: "Bizon Blade Ultra-Long Barrel",
  cat: "barrel",
  price: 14068,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BizonBladeUltraLongB_011d50f5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bizon%20Blade%20Ultra-Long%20Barrel"
 },
 {
  id: "bizon-paratrooper-short-barrel",
  name: "Bizon Paratrooper Short Barrel",
  cat: "barrel",
  price: 12847,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BizonParatrooperShor_40c4504a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bizon%20Paratrooper%20Short%20Barrel"
 },
 {
  id: "bizon-striker-standard-barrel",
  name: "Bizon Striker Standard Barrel",
  cat: "barrel",
  price: 12267,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BizonStrikerStandard_11a3e7d0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bizon%20Striker%20Standard%20Barrel"
 },
 {
  id: "desert-eagle-competition-barrel",
  name: "Desert Eagle Competition Barrel",
  cat: "barrel",
  price: 10864,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/DesertEagleCompetiti_3cfa093f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Desert%20Eagle%20Competition%20Barrel"
 },
 {
  id: "desert-eagle-rifled-long-barrel",
  name: "Desert Eagle Rifled Long Barrel",
  cat: "barrel",
  price: 15338,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/DesertEagleRifledLon_a6d0b60f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Desert%20Eagle%20Rifled%20Long%20Barrel"
 },
 {
  id: "g17-tactical-heavy-barrel",
  name: "G17 Tactical Heavy Barrel",
  cat: "barrel",
  price: 6841,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G17TacticalHeavyBarr_db015dba.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G17%20Tactical%20Heavy%20Barrel"
 },
 {
  id: "g18-impact-long-barrel",
  name: "G18 Impact Long Barrel",
  cat: "barrel",
  price: 22030,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G18ImpactLongBarrel_137f656a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G18%20Impact%20Long%20Barrel"
 },
 {
  id: "g3-enhanced-long-barrel-combo",
  name: "G3 Enhanced Long Barrel Combo",
  cat: "barrel",
  price: 30868,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3EnhancedLongBarrel_60f613c9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Enhanced%20Long%20Barrel%20Combo"
 },
 {
  id: "g3-guard-standard-barrel-combo",
  name: "G3 Guard Standard Barrel Combo",
  cat: "barrel",
  price: 26744,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3GuardStandardBarre_aebce071.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Guard%20Standard%20Barrel%20Combo"
 },
 {
  id: "g3-hurricane-short-barrel-combo",
  name: "G3 Hurricane Short Barrel Combo",
  cat: "barrel",
  price: 20144,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3HurricaneShortBarr_1bdd3089.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Hurricane%20Short%20Barrel%20Combo"
 },
 {
  id: "g3-platform-marksman-barrel-combo",
  name: "G3 Platform Marksman Barrel Combo",
  cat: "barrel",
  price: 44467,
  stats: {
   "Range": 12,
   "Control": 12,
   "Stability": 6,
   "Handling": -10,
   "Accuracy": -8
  },
  traits: [
   "Extra Single",
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/G3PlatformMarksmanBa_412e150c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Platform%20Marksman%20Barrel%20Combo"
 },
 {
  id: "k416-a8-barrel-combo",
  name: "K416 A8 Barrel Combo",
  cat: "barrel",
  price: 45466,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/K416A8BarrelCombo_98289475.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/K416%20A8%20Barrel%20Combo"
 },
 {
  id: "k416-a8-long-barrel-combo",
  name: "K416 A8 Long Barrel Combo",
  cat: "barrel",
  price: 48143,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/K416A8LongBarrelComb_a81dc636.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/K416%20A8%20Long%20Barrel%20Combo"
 },
 {
  id: "k416-elite-heavy-barrel-combo",
  name: "K416 Elite Heavy Barrel Combo",
  cat: "barrel",
  price: 27500,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/K416EliteHeavyBarrel_17fff03f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/K416%20Elite%20Heavy%20Barrel%20Combo"
 },
 {
  id: "k416-specops-short-barrel-combo",
  name: "K416 SpecOps Short Barrel Combo",
  cat: "barrel",
  price: 36540,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/K416SpecOpsShortBarr_576d8691.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/K416%20SpecOps%20Short%20Barrel%20Combo"
 },
 {
  id: "m1014-breakpoint-barrel",
  name: "M1014 Breakpoint Barrel",
  cat: "barrel",
  price: 23574,
  stats: {
   "Control": 12,
   "Handling": -6,
   "Accuracy": -8
  },
  traits: [
   "Extended Magazine",
   "Aiming Spread"
  ],
  img: "https://static.deltaforcetools.gg/images/M1014BreakpointBarre_3f2faf55.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1014%20Breakpoint%20Barrel"
 },
 {
  id: "m14-insight-ultra-long-barrel",
  name: "M14 Insight Ultra-Long Barrel",
  cat: "barrel",
  price: 134220,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M14InsightUltraLongB_edbae96b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20Insight%20Ultra-Long%20Barrel"
 },
 {
  id: "m14-roamer-standard-barrel",
  name: "M14 Roamer Standard Barrel",
  cat: "barrel",
  price: 94790,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M14RoamerStandardBar_e018521f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20Roamer%20Standard%20Barrel"
 },
 {
  id: "m14-whisper-short-barrel",
  name: "M14 Whisper Short Barrel",
  cat: "barrel",
  price: 85351,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M14WhisperShortBarre_75258059.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20Whisper%20Short%20Barrel"
 },
 {
  id: "m1911-nighthawk-tactical-barrel",
  name: "M1911 Nighthawk Tactical Barrel",
  cat: "barrel",
  price: 11048,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M1911NighthawkTactic_06060f1a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1911%20Nighthawk%20Tactical%20Barrel"
 },
 {
  id: "m249-gulf-short-barrel",
  name: "M249 Gulf Short Barrel",
  cat: "barrel",
  price: 73818,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M249GulfShortBarrel_ef0260cd.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Gulf%20Short%20Barrel"
 },
 {
  id: "m249-rhino-long-barrel",
  name: "M249 Rhino Long Barrel",
  cat: "barrel",
  price: 56067,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M249RhinoLongBarrel_0fe10009.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Rhino%20Long%20Barrel"
 },
 {
  id: "m250-sentinel-short-barrel",
  name: "M250 Sentinel Short Barrel",
  cat: "barrel",
  price: 38296,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 2,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M250SentinelShortBar_f93e5f8a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M250%20Sentinel%20Short%20Barrel"
 },
 {
  id: "m7-lizard-short-barrel",
  name: "M7 Lizard Short Barrel",
  cat: "barrel",
  price: 36540,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 2,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M7LizardShortBarrel_f8c7dd31.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%20Lizard%20Short%20Barrel"
 },
 {
  id: "m7-practical-long-barrel-combo",
  name: "M7 Practical Long Barrel Combo",
  cat: "barrel",
  price: 57652,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M7PracticalLongBarre_00ab718d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%20Practical%20Long%20Barrel%20Combo"
 },
 {
  id: "m7-tidal-ultra-long-barrel-combo",
  name: "M7 Tidal Ultra-Long Barrel Combo",
  cat: "barrel",
  price: 219297,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M7TidalUltraLongBarr_ca9608b8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%20Tidal%20Ultra-Long%20Barrel%20Combo"
 },
 {
  id: "m700-predator-military-barrel",
  name: "M700 Predator Military Barrel",
  cat: "barrel",
  price: 86950,
  stats: {
   "Range": 3,
   "Stability": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M700PredatorMilitary_3862e31c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Predator%20Military%20Barrel"
 },
 {
  id: "m700-stratosphere-long-barrel",
  name: "M700 Stratosphere Long Barrel",
  cat: "barrel",
  price: 93086,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -4,
   "Accuracy": -8
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/M700StratosphereLong_8150a0a9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Stratosphere%20Long%20Barrel"
 },
 {
  id: "m870-extended-barrel",
  name: "M870 Extended Barrel",
  cat: "barrel",
  price: 3696,
  stats: {
   "Range": 8,
   "Accuracy": 8,
   "Handling": -8
  },
  traits: [
   "Extended Magazine"
  ],
  img: "https://static.deltaforcetools.gg/images/M870ExtendedBarrel_ed82e31a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M870%20Extended%20Barrel"
 },
 {
  id: "mp5-performance-barrel-combo",
  name: "MP5 Performance Barrel Combo",
  cat: "barrel",
  price: 20316,
  stats: {
   "Range": 2,
   "Control": 2,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5PerformanceBarrel_b137ba7c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%20Performance%20Barrel%20Combo"
 },
 {
  id: "mp5-scout-long-barrel-combo",
  name: "MP5 Scout Long Barrel Combo",
  cat: "barrel",
  price: 30685,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5ScoutLongBarrelCo_392eaa1c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%20Scout%20Long%20Barrel%20Combo"
 },
 {
  id: "mp5-stealth-short-barrel-combo",
  name: "MP5 Stealth Short Barrel Combo",
  cat: "barrel",
  price: 39326,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5StealthShortBarre_29d626fe.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%20Stealth%20Short%20Barrel%20Combo"
 },
 {
  id: "mp5-tactical-barrel-combo",
  name: "MP5 Tactical Barrel Combo",
  cat: "barrel",
  price: 20813,
  stats: {
   "Range": 2,
   "Control": 2,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5TacticalBarrelCom_a60e3881.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%20Tactical%20Barrel%20Combo"
 },
 {
  id: "mp5sd-specops-integrally-suppressed-barrel",
  name: "MP5SD SpecOps Integrally Suppressed Barrel",
  cat: "barrel",
  price: 38759,
  stats: {
   "Range": 6,
   "Control": 6,
   "Handling": 3,
   "Stability": -4,
   "Accuracy": -12
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/MP5SDSpecOpsIntegral_e2707ce8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5SD%20SpecOps%20Integrally%20Suppressed%20Barrel"
 },
 {
  id: "mp7-enhanced-barrel-combo",
  name: "MP7 Enhanced Barrel Combo",
  cat: "barrel",
  price: 24326,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP7EnhancedBarrelCom_69b455fb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%20Enhanced%20Barrel%20Combo"
 },
 {
  id: "mp7-stinger-long-barrel-combo",
  name: "MP7 Stinger Long Barrel Combo",
  cat: "barrel",
  price: 45556,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP7StingerLongBarrel_4a36e722.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%20Stinger%20Long%20Barrel%20Combo"
 },
 {
  id: "mp7-wolf-fang-light-barrel",
  name: "MP7 Wolf Fang Light Barrel",
  cat: "barrel",
  price: 36388,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP7WolfFangLightBarr_3b7fb2ab.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%20Wolf%20Fang%20Light%20Barrel"
 },
 {
  id: "mini-14-enhanced-barrel",
  name: "Mini-14 Enhanced Barrel",
  cat: "barrel",
  price: 31438,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Mini14EnhancedBarrel_0e92e0d4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini-14%20Enhanced%20Barrel"
 },
 {
  id: "p90-cheetah-heavy-barrel",
  name: "P90 Cheetah Heavy Barrel",
  cat: "barrel",
  price: 46174,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/P90CheetahHeavyBarre_3913d460.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/P90%20Cheetah%20Heavy%20Barrel"
 },
 {
  id: "p90-heavy-assault-long-barrel",
  name: "P90 Heavy Assault Long Barrel",
  cat: "barrel",
  price: 51533,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/P90HeavyAssaultLongB_4faf6566.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/P90%20Heavy%20Assault%20Long%20Barrel"
 },
 {
  id: "pkm-horizon-heavy-barrel",
  name: "PKM Horizon Heavy Barrel",
  cat: "barrel",
  price: 63600,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PKMHorizonHeavyBarre_794ee5ad.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PKM%20Horizon%20Heavy%20Barrel"
 },
 {
  id: "pkm-trench-short-barrel",
  name: "PKM Trench Short Barrel",
  cat: "barrel",
  price: 49402,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PKMTrenchShortBarrel_70c446c1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PKM%20Trench%20Short%20Barrel"
 },
 {
  id: "qbz-95-tactical-barrel",
  name: "QBZ-95 Tactical Barrel",
  cat: "barrel",
  price: 11277,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/QBZ95TacticalBarrel_b1119fae.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/QBZ-95%20Tactical%20Barrel"
 },
 {
  id: "qbz95-1-longbow-barrel-combo",
  name: "QBZ95-1 Longbow Barrel Combo",
  cat: "barrel",
  price: 24394,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/QBZ951LongbowBarrelC_88e9f388.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/QBZ95-1%20Longbow%20Barrel%20Combo"
 },
 {
  id: "qbz95-1-practical-short-barrel",
  name: "QBZ95-1 Practical Short Barrel",
  cat: "barrel",
  price: 10666,
  stats: {
   "Control": 2,
   "Handling": 6,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/QBZ951PracticalShort_d045b177.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/QBZ95-1%20Practical%20Short%20Barrel"
 },
 {
  id: "r93-fission-long-barrel",
  name: "R93 Fission Long Barrel",
  cat: "barrel",
  price: 60710,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -4,
   "Accuracy": -8
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/R93FissionLongBarrel_68f8ec27.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/R93%20Fission%20Long%20Barrel"
 },
 {
  id: "r93-lightweight-short-barrel",
  name: "R93 Lightweight Short Barrel",
  cat: "barrel",
  price: 41510,
  stats: {
   "Handling": 8,
   "Stability": -4
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/R93LightweightShortB_51bffe72.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/R93%20Lightweight%20Short%20Barrel"
 },
 {
  id: "revolver-practical-long-barrel",
  name: "Revolver Practical Long Barrel",
  cat: "barrel",
  price: 3246,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/RevolverPracticalLon_4658f47a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Revolver%20Practical%20Long%20Barrel"
 },
 {
  id: "revolver-practical-short-barrel",
  name: "Revolver Practical Short Barrel",
  cat: "barrel",
  price: 2638,
  stats: {
   "Control": 2,
   "Handling": 6,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/RevolverPracticalSho_1d3e5a83.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Revolver%20Practical%20Short%20Barrel"
 },
 {
  id: "s12k-breakthrough-long-barrel-combo",
  name: "S12K Breakthrough Long Barrel Combo",
  cat: "barrel",
  price: 20752,
  stats: {
   "Control": 15,
   "Stability": 5,
   "Handling": -4,
   "Accuracy": -8
  },
  traits: [
   "Aiming Spread",
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/S12KBreakthroughLong_586c028c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%20Breakthrough%20Long%20Barrel%20Combo"
 },
 {
  id: "s12k-defender-short-barrel-set",
  name: "S12K Defender Short Barrel Set",
  cat: "barrel",
  price: 20826,
  stats: {
   "Control": 15,
   "Handling": 5,
   "Accuracy": -16
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/S12KDefenderShortBar_65828e03.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%20Defender%20Short%20Barrel%20Set"
 },
 {
  id: "s12k-practical-long-barrel-combo",
  name: "S12K Practical Long Barrel Combo",
  cat: "barrel",
  price: 12201,
  stats: {
   "Control": 10,
   "Accuracy": 8,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/S12KPracticalLongBar_ac4d5065.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%20Practical%20Long%20Barrel%20Combo"
 },
 {
  id: "s12k-practical-short-barrel-combo",
  name: "S12K Practical Short Barrel Combo",
  cat: "barrel",
  price: 14412,
  stats: {
   "Control": 10,
   "Handling": 2,
   "Accuracy": 8
  },
  traits: [
   "Aiming Spread"
  ],
  img: "https://static.deltaforcetools.gg/images/S12KPracticalShortBa_969880d3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%20Practical%20Short%20Barrel%20Combo"
 },
 {
  id: "scar-h-beaver-long-barrel",
  name: "SCAR-H Beaver Long Barrel",
  cat: "barrel",
  price: 52459,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SCARHBeaverLongBarre_7289ef64.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SCAR-H%20Beaver%20Long%20Barrel"
 },
 {
  id: "scar-h-practical-standard-barrel",
  name: "SCAR-H Practical Standard Barrel",
  cat: "barrel",
  price: 21966,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SCARHPracticalStanda_ada075de.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SCAR-H%20Practical%20Standard%20Barrel"
 },
 {
  id: "scar-h-type-0-short-barrel",
  name: "SCAR-H Type-0 Short Barrel",
  cat: "barrel",
  price: 33259,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SCARHType0ShortBarre_6df0a35e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SCAR-H%20Type-0%20Short%20Barrel"
 },
 {
  id: "sg552-knight-heavy-barrel",
  name: "SG552 Knight Heavy Barrel",
  cat: "barrel",
  price: 19034,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SG552KnightHeavyBarr_12cbc175.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SG552%20Knight%20Heavy%20Barrel"
 },
 {
  id: "sks-cutoff-standard-barrel",
  name: "SKS Cutoff Standard Barrel",
  cat: "barrel",
  price: 38372,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SKSCutoffStandardBar_0bae46ba.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SKS%20Cutoff%20Standard%20Barrel"
 },
 {
  id: "sks-instant-ultra-long-barrel",
  name: "SKS Instant Ultra-Long Barrel",
  cat: "barrel",
  price: 47854,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SKSInstantUltraLongB_d2991334.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SKS%20Instant%20Ultra-Long%20Barrel"
 },
 {
  id: "smg-45-bamboo-rat-short-barrel",
  name: "SMG-45 Bamboo Rat Short Barrel",
  cat: "barrel",
  price: 53601,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SMG45BambooRatShortB_a36bb34e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG-45%20Bamboo%20Rat%20Short%20Barrel"
 },
 {
  id: "smg-45-fission-long-barrel",
  name: "SMG-45 Fission Long Barrel",
  cat: "barrel",
  price: 54025,
  stats: {
   "Range": 5,
   "Control": 5,
   "Handling": 1,
   "Stability": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SMG45FissionLongBarr_e056be7a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG-45%20Fission%20Long%20Barrel"
 },
 {
  id: "smg-45-longbow-ultra-long-barrel",
  name: "SMG-45 Longbow Ultra-Long Barrel",
  cat: "barrel",
  price: 47256,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SMG45LongbowUltraLon_69a3277a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG-45%20Longbow%20Ultra-Long%20Barrel"
 },
 {
  id: "smg-45-practical-heavy-barrel",
  name: "SMG-45 Practical Heavy Barrel",
  cat: "barrel",
  price: 16154,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SMG45PracticalHeavyB_f66e311f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG-45%20Practical%20Heavy%20Barrel"
 },
 {
  id: "sr-25-instant-short-barrel",
  name: "SR-25 Instant Short Barrel",
  cat: "barrel",
  price: 75778,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR25InstantShortBarr_bdb22f3e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-25%20Instant%20Short%20Barrel"
 },
 {
  id: "sr-25-nova-ultra-long-barrel",
  name: "SR-25 Nova Ultra-Long Barrel",
  cat: "barrel",
  price: 58896,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR25NovaUltraLongBar_e2c032c5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-25%20Nova%20Ultra-Long%20Barrel"
 },
 {
  id: "sr-25-zephyr-long-barrel",
  name: "SR-25 Zephyr Long Barrel",
  cat: "barrel",
  price: 46524,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR25ZephyrLongBarrel_24ad58fe.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-25%20Zephyr%20Long%20Barrel"
 },
 {
  id: "sr-3m-cast-steel-tactical-barrel",
  name: "SR-3M Cast Steel Tactical Barrel",
  cat: "barrel",
  price: 35763,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR3MCastSteelTactica_02e0a5f1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-3M%20Cast%20Steel%20Tactical%20Barrel"
 },
 {
  id: "sv-98-agile-short-barrel",
  name: "SV-98 Agile Short Barrel",
  cat: "barrel",
  price: 79707,
  stats: {
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -3
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/SV98AgileShortBarrel_7861a1fb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SV-98%20Agile%20Short%20Barrel"
 },
 {
  id: "sv-98-dragonfly-light-barrel",
  name: "SV-98 Dragonfly Light Barrel",
  cat: "barrel",
  price: 77008,
  stats: {
   "Range": 2,
   "Control": 2,
   "Stability": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SV98DragonflyLightBa_b8b75869.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SV-98%20Dragonfly%20Light%20Barrel"
 },
 {
  id: "sv-98-sublime-ultra-long-barrel",
  name: "SV-98 Sublime Ultra-Long Barrel",
  cat: "barrel",
  price: 82242,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -4,
   "Accuracy": -8
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/SV98SublimeUltraLong_67df835e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SV-98%20Sublime%20Ultra-Long%20Barrel"
 },
 {
  id: "svd-black-thorn-ultra-long-barrel",
  name: "SVD Black Thorn Ultra-Long Barrel",
  cat: "barrel",
  price: 61742,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SVDBlackThornUltraLo_b1a53380.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%20Black%20Thorn%20Ultra-Long%20Barrel"
 },
 {
  id: "svd-practical-long-barrel",
  name: "SVD Practical Long Barrel",
  cat: "barrel",
  price: 20876,
  stats: {
   "Range": 6,
   "Control": 6,
   "Stability": 3,
   "Handling": -5,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SVDPracticalLongBarr_65a48b98.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%20Practical%20Long%20Barrel"
 },
 {
  id: "uzi-assault-standard-barrel",
  name: "UZI Assault Standard Barrel",
  cat: "barrel",
  price: 13339,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZIAssaultStandardBa_6b3b2d62.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Assault%20Standard%20Barrel"
 },
 {
  id: "uzi-competition-performance-long-barrel",
  name: "UZI Competition Performance Long Barrel",
  cat: "barrel",
  price: 10640,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZICompetitionPerfor_0f0694d7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Competition%20Performance%20Long%20Barrel"
 },
 {
  id: "uzi-quartermaster-long-barrel",
  name: "UZI Quartermaster Long Barrel",
  cat: "barrel",
  price: 10083,
  stats: {
   "Range": 5,
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZIQuartermasterLong_2552ae78.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Quartermaster%20Long%20Barrel"
 },
 {
  id: "vss-tsunami-long-barrel-combo",
  name: "VSS Tsunami Long Barrel Combo",
  cat: "barrel",
  price: 168222,
  stats: {
   "Range": 12,
   "Control": 12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VSSTsunamiLongBarrel_10bf733f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/VSS%20Tsunami%20Long%20Barrel%20Combo"
 },
 {
  id: "vector-bastion-heavy-barrel-combo",
  name: "Vector Bastion Heavy Barrel Combo",
  cat: "barrel",
  price: 48245,
  stats: {
   "Control": 8,
   "Handling": 6,
   "Accuracy": 8
  },
  traits: [
   "Range"
  ],
  img: "https://static.deltaforcetools.gg/images/VectorBastionHeavyBa_5aa3722f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%20Bastion%20Heavy%20Barrel%20Combo"
 },
 {
  id: "vector-longsword-ultra-long-barrel-combo",
  name: "Vector Longsword Ultra-Long Barrel Combo",
  cat: "barrel",
  price: 49765,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VectorLongswordUltra_d0dc6b8a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%20Longsword%20Ultra-Long%20Barrel%20Combo"
 },
 {
  id: "vector-rail-barrel-combo",
  name: "Vector Rail Barrel Combo",
  cat: "barrel",
  price: 34473,
  stats: {
   "Range": 3,
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VectorRailBarrelComb_f1eabf24.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%20Rail%20Barrel%20Combo"
 },
 {
  id: "vityaz-beaver-barrel",
  name: "Vityaz Beaver Barrel",
  cat: "barrel",
  price: 20598,
  stats: {
   "Range": 9,
   "Control": 9,
   "Stability": 4,
   "Handling": -7,
   "Accuracy": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VityazBeaverBarrel_30ccbed2.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vityaz%20Beaver%20Barrel"
 },
 {
  id: "vityaz-tactical-barrel",
  name: "Vityaz Tactical Barrel",
  cat: "barrel",
  price: 27598,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VityazTacticalBarrel_e25ef27e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vityaz%20Tactical%20Barrel"
 },
 {
  id: "angled-hand-stop",
  name: "Angled Hand Stop",
  cat: "foregrip",
  price: 20578,
  stats: {
   "Handling": 8,
   "Control": -2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AngledHandStop_64350e2a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Angled%20Hand%20Stop"
 },
 {
  id: "cr-prism-hand-stop",
  name: "CR Prism Hand Stop",
  cat: "foregrip",
  price: 23670,
  stats: {},
  traits: [
   "Extra",
   "Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/CRPrismHandStop_3904ae0a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/CR%20Prism%20Hand%20Stop"
 },
 {
  id: "collapsible-bipod-grip",
  name: "Collapsible Bipod Grip",
  cat: "foregrip",
  price: 21190,
  stats: {
   "Handling": 3
  },
  traits: [
   "Extra ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/CollapsibleBipodGrip_11b498db.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Collapsible%20Bipod%20Grip"
 },
 {
  id: "competition-hand-stop",
  name: "Competition Hand Stop",
  cat: "foregrip",
  price: 28454,
  stats: {
   "Handling": 5,
   "Accuracy": 12,
   "Control": -2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/CompetitionHandStop_1a34264d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Competition%20Hand%20Stop"
 },
 {
  id: "dawn-angled-flashlight-grip",
  name: "Dawn Angled Flashlight Grip",
  cat: "foregrip",
  price: 42698,
  stats: {
   "Handling": -6
  },
  traits: [
   "Flashlight (Floodlight)",
   "Extra ADS",
   "Extra Vertical"
  ],
  img: "https://static.deltaforcetools.gg/images/DawnAngledFlashlight_d7e3adb0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Dawn%20Angled%20Flashlight%20Grip"
 },
 {
  id: "daybreak-vertical-flashlight-grip",
  name: "Daybreak Vertical Flashlight Grip",
  cat: "foregrip",
  price: 22038,
  stats: {
   "Control": 6,
   "Stability": 2,
   "Handling": -7
  },
  traits: [
   "Flashlight (Spotlight)"
  ],
  img: "https://static.deltaforcetools.gg/images/DaybreakVerticalFlas_ac999f45.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Daybreak%20Vertical%20Flashlight%20Grip"
 },
 {
  id: "folding-grip",
  name: "Folding Grip",
  cat: "foregrip",
  price: 9391,
  stats: {
   "Handling": 2,
   "Stability": 5
  },
  traits: [
   "Extra Vertical"
  ],
  img: "https://static.deltaforcetools.gg/images/FoldingGrip_e73b37f9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Folding%20Grip"
 },
 {
  id: "k1-elite-bevel-foregrip",
  name: "K1 Elite Bevel Foregrip",
  cat: "foregrip",
  price: 19720,
  stats: {},
  traits: [
   "Extra Horizontal",
   "Extra Horizontal",
   "Extra Horizontal"
  ],
  img: "https://static.deltaforcetools.gg/images/K1EliteBevelForegrip_f0a3dc73.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/K1%20Elite%20Bevel%20Foregrip"
 },
 {
  id: "mini-hand-stop",
  name: "Mini Hand Stop",
  cat: "foregrip",
  price: 3144,
  stats: {
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MiniHandStop_e87112b2.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini%20Hand%20Stop"
 },
 {
  id: "phantom-vertical-foregrip",
  name: "Phantom Vertical Foregrip",
  cat: "foregrip",
  price: 66653,
  stats: {
   "Control": 4,
   "Stability": -4
  },
  traits: [
   "ADS Speed"
  ],
  img: "https://static.deltaforcetools.gg/images/PhantomVerticalForeg_1c3d17c4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Phantom%20Vertical%20Foregrip"
 },
 {
  id: "phase-combat-foregrip",
  name: "Phase Combat Foregrip",
  cat: "foregrip",
  price: 48141,
  stats: {
   "Control": 4,
   "Handling": 3,
   "Stability": 2,
   "Accuracy": 4
  },
  traits: [
   "Extra ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/PhaseCombatForegrip_d142e4b9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Phase%20Combat%20Foregrip"
 },
 {
  id: "practical-vertical-foregrip",
  name: "Practical Vertical Foregrip",
  cat: "foregrip",
  price: 3472,
  stats: {
   "Control": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PracticalVerticalFor_d086c301.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Vertical%20Foregrip"
 },
 {
  id: "rk-0-foregrip",
  name: "RK-0 Foregrip",
  cat: "foregrip",
  price: 23457,
  stats: {},
  traits: [
   "Extra Vertical",
   "Extra Vertical",
   "Extra Vertical"
  ],
  img: "https://static.deltaforcetools.gg/images/RK0Foregrip_5f39024a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/RK-0%20Foregrip"
 },
 {
  id: "resonant-ergonomic-grip",
  name: "Resonant Ergonomic Grip",
  cat: "foregrip",
  price: 64349,
  stats: {
   "Handling": -1
  },
  traits: [
   "Extra Vertical",
   "Extra Vertical",
   "Extra Vertical"
  ],
  img: "https://static.deltaforcetools.gg/images/ResonantErgonomicGri_c63b3c4c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Resonant%20Ergonomic%20Grip"
 },
 {
  id: "resonant-mkii-foregrip",
  name: "Resonant MKII Foregrip",
  cat: "foregrip",
  price: 38474,
  stats: {
   "Control": 6,
   "Handling": 6,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ResonantMKIIForegrip_b363c83d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Resonant%20MKII%20Foregrip"
 },
 {
  id: "secret-order-bevel-foregrip",
  name: "Secret Order Bevel Foregrip",
  cat: "foregrip",
  price: 46511,
  stats: {
   "Handling": -1
  },
  traits: [
   "Extra Horizontal",
   "Extra Horizontal",
   "Extra Horizontal"
  ],
  img: "https://static.deltaforcetools.gg/images/SecretOrderBevelFore_fef58233.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Secret%20Order%20Bevel%20Foregrip"
 },
 {
  id: "tactical-angled-foregrip",
  name: "Tactical Angled Foregrip",
  cat: "foregrip",
  price: 18758,
  stats: {
   "Control": 4,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/TacticalAngledForegr_89477db0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Tactical%20Angled%20Foregrip"
 },
 {
  id: "tactical-vertical-foregrip",
  name: "Tactical Vertical Foregrip",
  cat: "foregrip",
  price: 21561,
  stats: {
   "Handling": 6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/TacticalVerticalFore_60bbe6af.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Tactical%20Vertical%20Foregrip"
 },
 {
  id: "vfg-knight-foregrip",
  name: "VFG Knight Foregrip",
  cat: "foregrip",
  price: 8244,
  stats: {
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VFGKnightForegrip_51ed90af.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/VFG%20Knight%20Foregrip"
 },
 {
  id: "x25u-angled-combat-grip",
  name: "X25U Angled Combat Grip",
  cat: "foregrip",
  price: 27496,
  stats: {
   "Accuracy": 8,
   "Handling": -3,
   "Stability": -3
  },
  traits: [
   "Extra Vertical",
   "Extra Horizontal"
  ],
  img: "https://static.deltaforcetools.gg/images/X25UAngledCombatGrip_90715a43.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/X25U%20Angled%20Combat%20Grip"
 },
 {
  id: "zfsg-tactical-grip",
  name: "ZFSG Tactical Grip",
  cat: "foregrip",
  price: 3472,
  stats: {
   "Accuracy": 12,
   "Control": -1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ZFSGTacticalGrip_349555d8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ZFSG%20Tactical%20Grip"
 },
 {
  id: "ak-12-bipod",
  name: "AK-12 Bipod",
  cat: "functional",
  price: 9012,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AK12Bipod_d72b9158.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK-12%20Bipod"
 },
 {
  id: "aug-bipod",
  name: "AUG Bipod",
  cat: "functional",
  price: 9756,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AUGBipod_d590314f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%20Bipod"
 },
 {
  id: "awm-bipod",
  name: "AWM Bipod",
  cat: "functional",
  price: 36134,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AWMBipod_120dd6b4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AWM%20Bipod"
 },
 {
  id: "badger-small-mag-assist-black",
  name: "Badger Small Mag Assist (Black)",
  cat: "functional",
  price: 5635,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BadgerSmallMagAssist_b9698cdf.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Badger%20Small%20Mag%20Assist%20(Black)"
 },
 {
  id: "badger-small-mag-assist-green",
  name: "Badger Small Mag Assist (Green)",
  cat: "functional",
  price: 5509,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BadgerSmallMagAssist_b96f6fa4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Badger%20Small%20Mag%20Assist%20(Green)"
 },
 {
  id: "badger-small-mag-assist-sand",
  name: "Badger Small Mag Assist (Sand)",
  cat: "functional",
  price: 5635,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BadgerSmallMagAssist_080199b0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Badger%20Small%20Mag%20Assist%20(Sand)"
 },
 {
  id: "car-15-bound-flashlight",
  name: "CAR-15 Bound Flashlight",
  cat: "functional",
  price: 2524,
  stats: {
   "Handling": -3
  },
  traits: [
   "Flashlight (Floodlight)"
  ],
  img: "https://static.deltaforcetools.gg/images/CAR15BoundFlashlight_5b4d8e8c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/CAR-15%20Bound%20Flashlight"
 },
 {
  id: "coyote-medium-p-mag-assist-black",
  name: "Coyote Medium P. Mag Assist (Black)",
  cat: "functional",
  price: 5765,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/CoyoteMediumPMagAssi_5b9c5552.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Coyote%20Medium%20P${point}%20Mag%20Assist%20(Black)"
 },
 {
  id: "coyote-medium-p-mag-assist-green",
  name: "Coyote Medium P. Mag Assist (Green)",
  cat: "functional",
  price: 5509,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/CoyoteMediumPMagAssi_23fd335e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Coyote%20Medium%20P${point}%20Mag%20Assist%20(Green)"
 },
 {
  id: "coyote-medium-p-mag-assist-sand",
  name: "Coyote Medium P. Mag Assist (Sand)",
  cat: "functional",
  price: 5509,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/CoyoteMediumPMagAssi_45a9639b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Coyote%20Medium%20P${point}%20Mag%20Assist%20(Sand)"
 },
 {
  id: "dbal-x2-purple-laser-light-combo",
  name: "DBAL-X2 Purple Laser-Light Combo",
  cat: "functional",
  price: 29240,
  stats: {},
  traits: [
   "Allows Tactical",
   "Visible to"
  ],
  img: "https://static.deltaforcetools.gg/images/DBALX2PurpleLaserLig_6c0545b2.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/DBAL-X2%20Purple%20Laser-Light%20Combo"
 },
 {
  id: "flare-tactical-flashlight",
  name: "Flare Tactical Flashlight",
  cat: "functional",
  price: 41667,
  stats: {
   "Handling": -1
  },
  traits: [
   "Flashlight (Floodlight)",
   "Active Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/FlareTacticalFlashli_97aa89cb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Flare%20Tactical%20Flashlight"
 },
 {
  id: "grizzly-full-p-mag-assist-black",
  name: "Grizzly Full P. Mag Assist (Black)",
  cat: "functional",
  price: 5639,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/GrizzlyFullPMagAssis_b1b90441.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Grizzly%20Full%20P${point}%20Mag%20Assist%20(Black)"
 },
 {
  id: "grizzly-full-p-mag-assist-green",
  name: "Grizzly Full P. Mag Assist (Green)",
  cat: "functional",
  price: 5379,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/GrizzlyFullPMagAssis_c66be58b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Grizzly%20Full%20P${point}%20Mag%20Assist%20(Green)"
 },
 {
  id: "grizzly-full-p-mag-assist-sand",
  name: "Grizzly Full P. Mag Assist (Sand)",
  cat: "functional",
  price: 5635,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/GrizzlyFullPMagAssis_9c043425.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Grizzly%20Full%20P${point}%20Mag%20Assist%20(Sand)"
 },
 {
  id: "honeycomb-killflash",
  name: "Honeycomb Killflash",
  cat: "functional",
  price: 17087,
  stats: {
   "Handling": -3,
   "Stability": -3
  },
  traits: [
   "Reduces (Significantly)"
  ],
  img: "https://static.deltaforcetools.gg/images/HoneycombKillflash_bd3d2589.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Honeycomb%20Killflash"
 },
 {
  id: "hornet-handguard",
  name: "Hornet Handguard",
  cat: "functional",
  price: 5635,
  stats: {
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/HornetHandguard_362a3813.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Hornet%20Handguard"
 },
 {
  id: "hornet-smg-mag-assist-black",
  name: "Hornet SMG Mag Assist (Black)",
  cat: "functional",
  price: 5379,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/HornetSMGMagAssistBl_da394908.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Hornet%20SMG%20Mag%20Assist%20(Black)"
 },
 {
  id: "hornet-smg-mag-assist-green",
  name: "Hornet SMG Mag Assist (Green)",
  cat: "functional",
  price: 5509,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/HornetSMGMagAssistGr_998481eb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Hornet%20SMG%20Mag%20Assist%20(Green)"
 },
 {
  id: "hornet-smg-mag-assist-sand",
  name: "Hornet SMG Mag Assist (Sand)",
  cat: "functional",
  price: 5635,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/HornetSMGMagAssistSa_b5a1d69e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Hornet%20SMG%20Mag%20Assist%20(Sand)"
 },
 {
  id: "kc-hound-handguard",
  name: "KC Hound Handguard",
  cat: "functional",
  price: 5635,
  stats: {
   "Stability": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/KCHoundHandguard_e97540d5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/KC%20Hound%20Handguard"
 },
 {
  id: "la-3c-green-laser-light-combo",
  name: "LA-3C Green Laser-Light Combo",
  cat: "functional",
  price: 26528,
  stats: {},
  traits: [
   "Allows Tactical",
   "Visible to"
  ],
  img: "https://static.deltaforcetools.gg/images/LA3CGreenLaserLightC_7febe5a6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/LA-3C%20Green%20Laser-Light%20Combo"
 },
 {
  id: "m1911-nighthawk-tactical-hammer",
  name: "M1911 Nighthawk Tactical Hammer",
  cat: "functional",
  price: 18506,
  stats: {
   "Stability": -4
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/M1911NighthawkTactic_f5353180.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1911%20Nighthawk%20Tactical%20Hammer"
 },
 {
  id: "m1911-nighthawk-tactical-trigger",
  name: "M1911 Nighthawk Tactical Trigger",
  cat: "functional",
  price: 18506,
  stats: {
   "Control": -4
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/M1911NighthawkTactic_912b8ed7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1911%20Nighthawk%20Tactical%20Trigger"
 },
 {
  id: "modular-handguard-panel",
  name: "Modular Handguard Panel",
  cat: "functional",
  price: 5532,
  stats: {
   "Control": 1,
   "Stability": 1,
   "Handling": -2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ModularHandguardPane_f75179f7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Modular%20Handguard%20Panel"
 },
 {
  id: "olight-baldr-pro-r-multi-function-flashlight",
  name: "OLIGHT Baldr Pro R Multi-Function Flashlight",
  cat: "functional",
  price: 26801,
  stats: {},
  traits: [
   "Flashlight (Spotlight)",
   "Allows Tactical",
   "Visible to"
  ],
  img: "https://static.deltaforcetools.gg/images/OLIGHTBaldrProRMulti_cc952a4f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/OLIGHT%20Baldr%20Pro%20R%20Multi-Function%20Flashlight"
 },
 {
  id: "peq-2-red-laser-light-combo",
  name: "PEQ-2 Red Laser-Light Combo",
  cat: "functional",
  price: 25381,
  stats: {},
  traits: [
   "Allows Tactical",
   "Visible to"
  ],
  img: "https://static.deltaforcetools.gg/images/PEQ2RedLaserLightCom_013636dd.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PEQ-2%20Red%20Laser-Light%20Combo"
 },
 {
  id: "perst-7-blue-laser-light-combo",
  name: "PERST-7 Blue Laser-Light Combo",
  cat: "functional",
  price: 26932,
  stats: {},
  traits: [
   "Allows Tactical",
   "Visible to"
  ],
  img: "https://static.deltaforcetools.gg/images/PERST7BlueLaserLight_dce8e10c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PERST-7%20Blue%20Laser-Light%20Combo"
 },
 {
  id: "pkm-bipod",
  name: "PKM Bipod",
  cat: "functional",
  price: 9179,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PKMBipod_970a9fd8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PKM%20Bipod"
 },
 {
  id: "psg-1-precision-trigger",
  name: "PSG-1 Precision Trigger",
  cat: "functional",
  price: 75884,
  stats: {
   "Stability": -8
  },
  traits: [
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/PSG1PrecisionTrigger_0093e6c0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PSG-1%20Precision%20Trigger"
 },
 {
  id: "practical-bipod",
  name: "Practical Bipod",
  cat: "functional",
  price: 15594,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PracticalBipod_c271d0bc.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Bipod"
 },
 {
  id: "practical-weapon-light",
  name: "Practical Weapon Light‏‏‎‏",
  cat: "functional",
  price: 7630,
  stats: {
   "Handling": -1
  },
  traits: [
   "Flashlight (Spotlight)"
  ],
  img: "https://static.deltaforcetools.gg/images/PracticalWeaponLight_1bc17ba3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Weapon%20Light%E2%80%8F%E2%80%8F%E2%80%8E%E2%80%8F"
 },
 {
  id: "r93-barrel-heat-shield",
  name: "R93 Barrel Heat Shield",
  cat: "functional",
  price: 5632,
  stats: {
   "Handling": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/R93BarrelHeatShield_1c4d28e6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/R93%20Barrel%20Heat%20Shield"
 },
 {
  id: "ranger-handguard",
  name: "Ranger Handguard",
  cat: "functional",
  price: 5635,
  stats: {
   "Control": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/RangerHandguard_7fe8e973.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Ranger%20Handguard"
 },
 {
  id: "sv-98-bipod",
  name: "SV-98 Bipod",
  cat: "functional",
  price: 8568,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SV98Bipod_b87c3ecb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SV-98%20Bipod"
 },
 {
  id: "underbarrel-pistol-light",
  name: "Underbarrel Pistol Light",
  cat: "functional",
  price: 9624,
  stats: {
   "Handling": -1
  },
  traits: [
   "Flashlight (Spotlight)"
  ],
  img: "https://static.deltaforcetools.gg/images/UnderbarrelPistolLig_2e86b7bb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Underbarrel%20Pistol%20Light"
 },
 {
  id: "95-longbow-platform-kit",
  name: "95 Longbow Platform Kit",
  cat: "handguard",
  price: 19320,
  stats: {
   "Control": 6,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": -8
  },
  traits: [
   "Adds Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/95LongbowPlatformKit_77a4b6dd.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/95%20Longbow%20Platform%20Kit"
 },
 {
  id: "aks-74-lower-rail-handguard",
  name: "AKS-74 Lower Rail Handguard",
  cat: "handguard",
  price: 6052,
  stats: {
   "Control": 2,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": 8
  },
  traits: [
   "Adds: Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/AKS74LowerRailHandgu_d08b3052.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKS-74%20Lower%20Rail%20Handguard"
 },
 {
  id: "aks-74-upper-rail-handguard",
  name: "AKS-74 Upper Rail Handguard",
  cat: "handguard",
  price: 10073,
  stats: {
   "Control": 2,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": 8
  },
  traits: [
   "Adds: Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/AKS74UpperRailHandgu_0bd4ffb2.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKS-74%20Upper%20Rail%20Handguard"
 },
 {
  id: "awm-m-lok-kit",
  name: "AWM M-Lok Kit",
  cat: "handguard",
  price: 46682,
  stats: {
   "Handling": 3,
   "Stability": 4,
   "Control": -3
  },
  traits: [
   "Adds: Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/AWMMLokKit_334b419d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AWM%20M-Lok%20Kit"
 },
 {
  id: "bizon-carbon-fiber-handguard",
  name: "Bizon Carbon Fiber Handguard",
  cat: "handguard",
  price: 9646,
  stats: {
   "Control": 4,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BizonCarbonFiberHand_901fc084.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bizon%20Carbon%20Fiber%20Handguard"
 },
 {
  id: "m1014-rail-handguard",
  name: "M1014 Rail Handguard",
  cat: "handguard",
  price: 8338,
  stats: {
   "Control": 3,
   "Handling": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M1014RailHandguard_be897717.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1014%20Rail%20Handguard"
 },
 {
  id: "m14-adv-frame-system",
  name: "M14 Adv. Frame System",
  cat: "handguard",
  price: 166822,
  stats: {
   "Control": 4,
   "Handling": 4
  },
  traits: [
   "Adds Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/M14AdvFrameSystem_a75c812f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20Adv%24%7Bpoint%7D%20Frame%20System"
 },
 {
  id: "m14-polymer-integral-stock",
  name: "M14 Polymer Integral Stock",
  cat: "handguard",
  price: 21849,
  stats: {
   "Control": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M14PolymerIntegralSt_0c4a0e6a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20Polymer%20Integral%20Stock"
 },
 {
  id: "m14-rail-integral-stock",
  name: "M14 Rail Integral Stock",
  cat: "handguard",
  price: 89108,
  stats: {
   "Control": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M14RailIntegralStock_9388b93d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20Rail%20Integral%20Stock"
 },
 {
  id: "m249-bipod-handguard",
  name: "M249 Bipod Handguard",
  cat: "handguard",
  price: 15812,
  stats: {},
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M249BipodHandguard_8de2be94.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Bipod%20Handguard"
 },
 {
  id: "m249-military-rail-handguard",
  name: "M249 Military Rail Handguard",
  cat: "handguard",
  price: 39250,
  stats: {
   "Control": 4,
   "Stability": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M249MilitaryRailHand_28401f63.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Military%20Rail%20Handguard"
 },
 {
  id: "m249-rail-handguard",
  name: "M249 Rail Handguard",
  cat: "handguard",
  price: 28285,
  stats: {
   "Control": 4,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M249RailHandguard_6ce3c60b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Rail%20Handguard"
 },
 {
  id: "m700-adv-frame-system",
  name: "M700 Adv. Frame System",
  cat: "handguard",
  price: 89873,
  stats: {
   "Handling": 5,
   "Stability": 5,
   "Control": -2
  },
  traits: [
   "Adds: Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/M700AdvFrameSystem_d257cc0f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Adv%24%7Bpoint%7D%20Frame%20System"
 },
 {
  id: "m700-black-integral-stock",
  name: "M700 Black Integral Stock",
  cat: "handguard",
  price: 34096,
  stats: {
   "Handling": 7,
   "Stability": -3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M700BlackIntegralSto_2c83e20c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Black%20Integral%20Stock"
 },
 {
  id: "m700-military-handguard",
  name: "M700 Military Handguard",
  cat: "handguard",
  price: 28950,
  stats: {
   "Handling": 4,
   "Control": -6
  },
  traits: [
   "Hit Stability"
  ],
  img: "https://static.deltaforcetools.gg/images/M700MilitaryHandguar_dae0b7cd.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Military%20Handguard"
 },
 {
  id: "m700-stable-integral-stock",
  name: "M700 Stable Integral Stock",
  cat: "handguard",
  price: 28248,
  stats: {
   "Stability": 7,
   "Handling": -3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M700StableIntegralSt_6ce3f35a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Stable%20Integral%20Stock"
 },
 {
  id: "m870-rail-handguard",
  name: "M870 Rail Handguard",
  cat: "handguard",
  price: 1091,
  stats: {
   "Control": 2,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M870RailHandguard_76c94516.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M870%20Rail%20Handguard"
 },
 {
  id: "mini-14-adv-frame-system",
  name: "Mini-14 Adv. Frame System",
  cat: "handguard",
  price: 42535,
  stats: {
   "Control": 4,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Mini14AdvFrameSystem_69d386bd.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini-14%20Adv%24%7Bpoint%7D%20Frame%20System"
 },
 {
  id: "mini-14-polymer-integral-stock",
  name: "Mini-14 Polymer Integral Stock",
  cat: "handguard",
  price: 16746,
  stats: {
   "Control": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Mini14PolymerIntegra_d7750869.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini-14%20Polymer%20Integral%20Stock"
 },
 {
  id: "mini-14-polymer-stock",
  name: "Mini-14 Polymer Stock",
  cat: "handguard",
  price: 15498,
  stats: {
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Mini14PolymerStock_36e402ad.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini-14%20Polymer%20Stock"
 },
 {
  id: "sks-advanced-handguard",
  name: "SKS Advanced Handguard",
  cat: "handguard",
  price: 49864,
  stats: {
   "Control": 6,
   "Handling": 2
  },
  traits: [
   "Adds: Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/SKSAdvancedHandguard_8226a5ae.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SKS%20Advanced%20Handguard"
 },
 {
  id: "sr-25-elite-handguard",
  name: "SR-25 Elite Handguard",
  cat: "handguard",
  price: 31718,
  stats: {
   "Handling": 2,
   "Stability": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR25EliteHandguard_4d176a82.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-25%20Elite%20Handguard"
 },
 {
  id: "svd-polymer-handguard",
  name: "SVD Polymer Handguard",
  cat: "handguard",
  price: 24540,
  stats: {
   "Stability": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SVDPolymerHandguard_6e67bf48.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%20Polymer%20Handguard"
 },
 {
  id: "svd-rail-handguard",
  name: "SVD Rail Handguard",
  cat: "handguard",
  price: 50553,
  stats: {
   "Handling": 2,
   "Stability": 6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SVDRailHandguard_94958ca7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%20Rail%20Handguard"
 },
 {
  id: "uzi-performance-handguard",
  name: "UZI Performance Handguard",
  cat: "handguard",
  price: 16454,
  stats: {
   "Control": 8,
   "Handling": 3,
   "Stability": 3,
   "Accuracy": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZIPerformanceHandgu_b6d60e61.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Performance%20Handguard"
 },
 {
  id: "uzi-rail-handguard",
  name: "UZI Rail Handguard",
  cat: "handguard",
  price: 10266,
  stats: {
   "Control": 4,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZIRailHandguard_e535ed5b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Rail%20Handguard"
 },
 {
  id: "5-56x45-30-round-aluminum-mag",
  name: "5.56x45 30-Round Aluminum Mag",
  cat: "mag",
  price: 3370,
  stats: {
   "Holds": 30
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/556x4530RoundAluminu_7efcbdfa.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/5%2E56x45%2030-Round%20Aluminum%20Mag"
 },
 {
  id: "5-56x45-30-round-polymer-mag",
  name: "5.56x45 30-Round Polymer Mag",
  cat: "mag",
  price: 6484,
  stats: {
   "Holds": 30,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/556x4530RoundPolymer_26a71369.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/5%2E56x45%2030-Round%20Polymer%20Mag"
 },
 {
  id: "5-8-newtype-30-round-mag",
  name: "5.8 Newtype 30-Round Mag",
  cat: "mag",
  price: 7108,
  stats: {
   "Holds": 30,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/58Newtype30RoundMag_b0a217c5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/5%2E8%20Newtype%2030-Round%20Mag"
 },
 {
  id: "5-8-newtype-60-round-drum-mag",
  name: "5.8 Newtype 60-Round Drum Mag",
  cat: "mag",
  price: 35062,
  stats: {
   "Holds": 60,
   "Handling": -9
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/58Newtype60RoundDrum_5ec0fb8d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/5%2E8%20Newtype%2060-Round%20Drum%20Mag"
 },
 {
  id: "93r-18-round-mag",
  name: "93R 18-Round Mag",
  cat: "mag",
  price: 2961,
  stats: {
   "Holds": 18,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/93R18RoundMag_2a7134b9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/93R%2018-Round%20Mag"
 },
 {
  id: "93r-24-round-mag",
  name: "93R 24-Round Mag",
  cat: "mag",
  price: 7030,
  stats: {
   "Holds": 24,
   "Handling": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/93R24RoundMag_dbb5f874.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/93R%2024-Round%20Mag"
 },
 {
  id: "ak-12-30-round-polymer-mag",
  name: "AK-12 30-Round Polymer Mag",
  cat: "mag",
  price: 3394,
  stats: {
   "Holds": 30,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AK1230RoundPolymerMa_bf790243.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK-12%2030-Round%20Polymer%20Mag"
 },
 {
  id: "ak545-30-round-mag",
  name: "AK545 30-Round Mag",
  cat: "mag",
  price: 3197,
  stats: {
   "Holds": 30
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AK54530RoundMag_914847d7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK545%2030-Round%20Mag"
 },
 {
  id: "akm-30-round-polymer-mag",
  name: "AKM 30-Round Polymer Mag",
  cat: "mag",
  price: 3624,
  stats: {
   "Holds": 30,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKM30RoundPolymerMag_af0a9144.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%2030-Round%20Polymer%20Mag"
 },
 {
  id: "akm-40-round-extended-mag",
  name: "AKM 40-Round Extended Mag",
  cat: "mag",
  price: 23477,
  stats: {
   "Holds": 40,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKM40RoundExtendedMa_a2dc1fb4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%2040-Round%20Extended%20Mag"
 },
 {
  id: "akm-70-round-large-drum-mag",
  name: "AKM 70-Round Large Drum Mag",
  cat: "mag",
  price: 54376,
  stats: {
   "Holds": 70,
   "Handling": -15
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKM70RoundLargeDrumM_e5ec484d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKM%2070-Round%20Large%20Drum%20Mag"
 },
 {
  id: "aks-74-30-round-mag",
  name: "AKS-74 30-Round Mag",
  cat: "mag",
  price: 3197,
  stats: {
   "Holds": 30
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKS7430RoundMag_e5de76e7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKS-74%2030-Round%20Mag"
 },
 {
  id: "aks-74-45-round-extended-mag",
  name: "AKS-74 45-Round Extended Mag",
  cat: "mag",
  price: 22513,
  stats: {
   "Holds": 45,
   "Handling": -5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKS7445RoundExtended_c88e5b90.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKS-74%2045-Round%20Extended%20Mag"
 },
 {
  id: "aks-74-75-round-polymer-drum-mag",
  name: "AKS-74 75-Round Polymer Drum Mag",
  cat: "mag",
  price: 30114,
  stats: {
   "Holds": 75,
   "Handling": -9
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKS7475RoundPolymerD_52a0afb7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AKS-74%2075-Round%20Polymer%20Drum%20Mag"
 },
 {
  id: "ash-12-30-round-extended-mag",
  name: "ASh-12 30-Round Extended Mag",
  cat: "mag",
  price: 36590,
  stats: {
   "Holds": 30,
   "Handling": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ASh1230RoundExtended_9de88870.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ASh-12%2030-Round%20Extended%20Mag"
 },
 {
  id: "aug-60-round-drum-mag",
  name: "AUG 60-Round Drum Mag",
  cat: "mag",
  price: 26174,
  stats: {
   "Holds": 60,
   "Handling": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AUG60RoundDrumMag_bebdeeb8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%2060-Round%20Drum%20Mag"
 },
 {
  id: "bizon-64-round-helical-mag",
  name: "Bizon 64-Round Helical Mag",
  cat: "mag",
  price: 6938,
  stats: {
   "Holds": 64,
   "Handling": -5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Bizon64RoundHelicalM_67905c76.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bizon%2064-Round%20Helical%20Mag"
 },
 {
  id: "desert-eagle-13-round-mag",
  name: "Desert Eagle 13-Round Mag",
  cat: "mag",
  price: 5319,
  stats: {
   "Holds": 13,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/DesertEagle13RoundMa_f44c5a3f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Desert%20Eagle%2013-Round%20Mag"
 },
 {
  id: "g-series-pistol-25-round-mag",
  name: "G-Series Pistol 25-Round Mag",
  cat: "mag",
  price: 3645,
  stats: {
   "Holds": 25,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/GSeriesPistol25Round_54f5fe82.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G-Series%20Pistol%2025-Round%20Mag"
 },
 {
  id: "g-series-pistol-33-round-mag",
  name: "G-Series Pistol 33-Round Mag",
  cat: "mag",
  price: 12592,
  stats: {
   "Holds": 33,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/GSeriesPistol33Round_aed9085d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G-Series%20Pistol%2033-Round%20Mag"
 },
 {
  id: "g3-30-round-mag",
  name: "G3 30-Round Mag",
  cat: "mag",
  price: 14195,
  stats: {
   "Holds": 30,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G330RoundMag_ec5aff54.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%2030-Round%20Mag"
 },
 {
  id: "g3-50-round-drum-mag",
  name: "G3 50-Round Drum Mag",
  cat: "mag",
  price: 18626,
  stats: {
   "Holds": 50,
   "Handling": -15
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G350RoundDrumMag_c905c78f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%2050-Round%20Drum%20Mag"
 },
 {
  id: "m14-20-round-mag",
  name: "M14 20-Round Mag",
  cat: "mag",
  price: 20839,
  stats: {
   "Holds": 20,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M1420RoundMag_a3b0e2bd.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%2020-Round%20Mag"
 },
 {
  id: "m14-30-round-mag",
  name: "M14 30-Round Mag",
  cat: "mag",
  price: 40797,
  stats: {
   "Holds": 30,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M1430RoundMag_cb15c96f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%2030-Round%20Mag"
 },
 {
  id: "m14-50-round-drum-mag",
  name: "M14 50-Round Drum Mag",
  cat: "mag",
  price: 169480,
  stats: {
   "Holds": 50,
   "Handling": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M1450RoundDrumMag_e2f5cfc4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%2050-Round%20Drum%20Mag"
 },
 {
  id: "m1911-11-round-extended-mag",
  name: "M1911 11-Round Extended Mag",
  cat: "mag",
  price: 3952,
  stats: {
   "Holds": 11,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M191111RoundExtended_69b0bbd6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1911%2011-Round%20Extended%20Mag"
 },
 {
  id: "m250-75-round-belt",
  name: "M250 75-Round Belt",
  cat: "mag",
  price: 46187,
  stats: {
   "Holds": 75,
   "Handling": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M25075RoundBelt_07ebf95a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M250%2075-Round%20Belt"
 },
 {
  id: "m4-45-round-extended-mag",
  name: "M4 45-Round Extended Mag",
  cat: "mag",
  price: 23036,
  stats: {
   "Holds": 45
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M445RoundExtendedMag_e9eb66cb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M4%2045-Round%20Extended%20Mag"
 },
 {
  id: "m4-60-round-drum-mag",
  name: "M4 60-Round Drum Mag",
  cat: "mag",
  price: 27450,
  stats: {
   "Holds": 60,
   "Handling": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M460RoundDrumMag_c9a6ed07.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M4%2060-Round%20Drum%20Mag"
 },
 {
  id: "m7-6-8-30-round-mag",
  name: "M7 6.8 30-Round Mag",
  cat: "mag",
  price: 30138,
  stats: {
   "Holds": 30,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M76830RoundMag_cab4ddd9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%206%2E8%2030-Round%20Mag"
 },
 {
  id: "m7-6-8-45-round-drum-mag",
  name: "M7 6.8 45-Round Drum Mag",
  cat: "mag",
  price: 41829,
  stats: {
   "Holds": 45,
   "Handling": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M76845RoundDrumMag_5fcdaad6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%206%2E8%2045-Round%20Drum%20Mag"
 },
 {
  id: "m700-10-round-mag",
  name: "M700 10-Round Mag",
  cat: "mag",
  price: 26972,
  stats: {
   "Holds": 10,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M70010RoundMag_f8e44fa7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%2010-Round%20Mag"
 },
 {
  id: "mp5-50-round-drum-mag",
  name: "MP5 50-Round Drum Mag",
  cat: "mag",
  price: 37238,
  stats: {
   "Holds": 50,
   "Handling": -9
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP550RoundDrumMag_6003046e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%2050-Round%20Drum%20Mag"
 },
 {
  id: "mp7-30-round-mag",
  name: "MP7 30-Round Mag",
  cat: "mag",
  price: 15344,
  stats: {
   "Holds": 30
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP730RoundMag_9fc79eb8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%2030-Round%20Mag"
 },
 {
  id: "mp7-40-round-mag",
  name: "MP7 40-Round Mag",
  cat: "mag",
  price: 40195,
  stats: {
   "Holds": 40,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP740RoundMag_94e5b803.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%2040-Round%20Mag"
 },
 {
  id: "mp7-60-round-drum-mag",
  name: "MP7 60-Round Drum Mag",
  cat: "mag",
  price: 38193,
  stats: {
   "Holds": 60,
   "Handling": -15
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP760RoundDrumMag_ff27c077.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%2060-Round%20Drum%20Mag"
 },
 {
  id: "mini-14-20-round-mag",
  name: "Mini-14 20-Round Mag",
  cat: "mag",
  price: 6390,
  stats: {
   "Holds": 20,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Mini1420RoundMag_9ec30001.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini-14%2020-Round%20Mag"
 },
 {
  id: "mini-14-30-round-mag",
  name: "Mini-14 30-Round Mag",
  cat: "mag",
  price: 46038,
  stats: {
   "Holds": 30,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Mini1430RoundMag_89891abb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini-14%2030-Round%20Mag"
 },
 {
  id: "pkm-extended-magazine",
  name: "PKM Extended Magazine",
  cat: "mag",
  price: 26204,
  stats: {
   "Holds": 125,
   "Handling": -15
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PKMExtendedMagazine_255633a6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PKM%20Extended%20Magazine"
 },
 {
  id: "psg-20-round-extended-mag",
  name: "PSG 20-Round Extended Mag",
  cat: "mag",
  price: 19497,
  stats: {
   "Holds": 20,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PSG20RoundExtendedMa_aff84b0c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PSG%2020-Round%20Extended%20Mag"
 },
 {
  id: "r93-15-round-mag",
  name: "R93 15-Round Mag",
  cat: "mag",
  price: 26258,
  stats: {
   "Holds": 15,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/R9315RoundMag_2cf4e195.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/R93%2015-Round%20Mag"
 },
 {
  id: "s12k-10-round-extended-mag",
  name: "S12K 10-Round Extended Mag",
  cat: "mag",
  price: 5424,
  stats: {
   "Holds": 10,
   "Handling": -10
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/S12K10RoundExtendedM_90bb4bb7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%2010-Round%20Extended%20Mag"
 },
 {
  id: "s12k-24-round-extended-drum-mag",
  name: "S12K 24-Round Extended Drum Mag",
  cat: "mag",
  price: 38871,
  stats: {
   "Holds": 24,
   "Handling": -20
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/S12K24RoundExtendedD_693dadce.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%2024-Round%20Extended%20Drum%20Mag"
 },
 {
  id: "scar-h-30-round-mag",
  name: "SCAR-H 30-Round Mag",
  cat: "mag",
  price: 46667,
  stats: {
   "Holds": 30,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SCARH30RoundMag_0d6a6657.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SCAR-H%2030-Round%20Mag"
 },
 {
  id: "scar-h-50-round-drum-mag",
  name: "SCAR-H 50-Round Drum Mag",
  cat: "mag",
  price: 33226,
  stats: {
   "Holds": 50,
   "Handling": -15
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SCARH50RoundDrumMag_67a38409.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SCAR-H%2050-Round%20Drum%20Mag"
 },
 {
  id: "sg552-30-round-mag",
  name: "SG552 30-Round Mag",
  cat: "mag",
  price: 3534,
  stats: {
   "Holds": 30
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SG55230RoundMag_f4a6afd8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SG552%2030-Round%20Mag"
 },
 {
  id: "sg552-45-round-extended-mag",
  name: "SG552 45-Round Extended Mag",
  cat: "mag",
  price: 47438,
  stats: {
   "Holds": 45,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SG55245RoundExtended_a965a219.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SG552%2045-Round%20Extended%20Mag"
 },
 {
  id: "smg-45-40-round-extended-mag",
  name: "SMG-45 40-Round Extended Mag",
  cat: "mag",
  price: 25988,
  stats: {
   "Holds": 40,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SMG4540RoundExtended_a1957bc7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG-45%2040-Round%20Extended%20Mag"
 },
 {
  id: "sr-25-20-round-mag",
  name: "SR-25 20-Round Mag",
  cat: "mag",
  price: 29350,
  stats: {
   "Holds": 20,
   "Handling": -9
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR2520RoundMag_257102e6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-25%2020-Round%20Mag"
 },
 {
  id: "sr-25-30-round-extended-mag",
  name: "SR-25 30-Round Extended Mag",
  cat: "mag",
  price: 94032,
  stats: {
   "Holds": 30,
   "Handling": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR2530RoundExtendedM_4327a079.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-25%2030-Round%20Extended%20Mag"
 },
 {
  id: "svd-20-round-mag",
  name: "SVD 20-Round Mag",
  cat: "mag",
  price: 20802,
  stats: {
   "Holds": 20,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SVD20RoundMag_31a2afa4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%2020-Round%20Mag"
 },
 {
  id: "uzi-35-round-mag",
  name: "UZI 35-Round Mag",
  cat: "mag",
  price: 4590,
  stats: {
   "Holds": 35,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZI35RoundMag_86f22431.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%2035-Round%20Mag"
 },
 {
  id: "uzi-45-round-mag",
  name: "UZI 45-Round Mag",
  cat: "mag",
  price: 9085,
  stats: {
   "Holds": 45,
   "Handling": -9
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZI45RoundMag_f876a9af.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%2045-Round%20Mag"
 },
 {
  id: "vss-30-round-mag",
  name: "VSS 30-Round Mag",
  cat: "mag",
  price: 17734,
  stats: {
   "Holds": 30,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VSS30RoundMag_0d555294.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/VSS%2030-Round%20Mag"
 },
 {
  id: "vss-45-round-mag",
  name: "VSS 45-Round Mag",
  cat: "mag",
  price: 47081,
  stats: {
   "Holds": 45,
   "Handling": -8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VSS45RoundMag_8236d7cc.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/VSS%2045-Round%20Mag"
 },
 {
  id: "vector-30-round-extended-mag",
  name: "Vector 30-Round Extended Mag",
  cat: "mag",
  price: 15344,
  stats: {
   "Holds": 30,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Vector30RoundExtende_b453191e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%2030-Round%20Extended%20Mag"
 },
 {
  id: "vector-40-round-extended-mag",
  name: "Vector 40-Round Extended Mag",
  cat: "mag",
  price: 27429,
  stats: {
   "Holds": 40,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Vector40RoundExtende_832c3da3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%2040-Round%20Extended%20Mag"
 },
 {
  id: "vector-70-round-extended-c-mag",
  name: "Vector 70-Round Extended C-Mag",
  cat: "mag",
  price: 107613,
  stats: {
   "Holds": 70,
   "Handling": -15
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Vector70RoundExtende_d65abf68.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%2070-Round%20Extended%20C-Mag"
 },
 {
  id: "vityaz-45-round-extended-mag",
  name: "Vityaz 45-Round Extended Mag",
  cat: "mag",
  price: 16993,
  stats: {
   "Holds": 45,
   "Handling": -12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/Vityaz45RoundExtende_87e4e4f0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vityaz%2045-Round%20Extended%20Mag"
 },
 {
  id: "ak-bravefire-suppressor",
  name: "AK Bravefire Suppressor",
  cat: "muzzle",
  price: 28363,
  stats: {
   "Range": 4,
   "Stability": 4,
   "Handling": -10
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/AKBravefireSuppresso_abc5c25c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Bravefire%20Suppressor"
 },
 {
  id: "ak-practical-compensator",
  name: "AK Practical Compensator",
  cat: "muzzle",
  price: 10406,
  stats: {
   "Control": 7,
   "Stability": -2
  },
  traits: [
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/AKPracticalCompensat_56b3a91d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Practical%20Compensator"
 },
 {
  id: "advanced-multi-caliber-suppressor",
  name: "Advanced Multi-Caliber Suppressor",
  cat: "muzzle",
  price: 57674,
  stats: {
   "Handling": -3,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot",
   "Extra Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/AdvancedMultiCaliber_e40af4f0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Advanced%20Multi-Caliber%20Suppressor"
 },
 {
  id: "bastion-horizontal-compensator",
  name: "Bastion Horizontal Compensator",
  cat: "muzzle",
  price: 48902,
  stats: {},
  traits: [
   "Extra Horizontal Recoil",
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/BastionHorizontalCom_29716067.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bastion%20Horizontal%20Compensator"
 },
 {
  id: "bell-mouth-flash-hider",
  name: "Bell Mouth Flash Hider",
  cat: "muzzle",
  price: 5088,
  stats: {
   "Control": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BellMouthFlashHider_1aa42619.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Bell%20Mouth%20Flash%20Hider"
 },
 {
  id: "birdcage-flash-hider",
  name: "Birdcage Flash Hider",
  cat: "muzzle",
  price: 4680,
  stats: {
   "Control": 2,
   "Stability": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BirdcageFlashHider_d0a4e398.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Birdcage%20Flash%20Hider"
 },
 {
  id: "blazing-fire-suppressor",
  name: "Blazing Fire Suppressor",
  cat: "muzzle",
  price: 19633,
  stats: {
   "Control": 6,
   "Muzzle Flash": 1,
   "Handling": -1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BlazingFireSuppresso_e5dd1d4d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Blazing%20Fire%20Suppressor"
 },
 {
  id: "dtk-muzzle-brake",
  name: "DTK Muzzle Brake",
  cat: "muzzle",
  price: 28157,
  stats: {
   "Accuracy": 12
  },
  traits: [
   "Extra Firing",
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/DTKMuzzleBrake_0b64ef28.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/DTK%20Muzzle%20Brake"
 },
 {
  id: "elite-pistol-muzzle-brake",
  name: "Elite Pistol Muzzle Brake",
  cat: "muzzle",
  price: 11122,
  stats: {
   "Handling": -3
  },
  traits: [
   "Extra Vertical Recoil"
  ],
  img: "https://static.deltaforcetools.gg/images/ElitePistolMuzzleBra_190dd1bc.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Elite%20Pistol%20Muzzle%20Brake"
 },
 {
  id: "ember-suppressor",
  name: "Ember Suppressor",
  cat: "muzzle",
  price: 37396,
  stats: {
   "Control": 8,
   "Handling": -9
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/EmberSuppressor_fbbb01ee.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Ember%20Suppressor"
 },
 {
  id: "m7-practical-suppressor",
  name: "M7 Practical Suppressor",
  cat: "muzzle",
  price: 32718,
  stats: {
   "Control": 8,
   "Handling": -11
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/M7PracticalSuppresso_c338341b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%20Practical%20Suppressor"
 },
 {
  id: "ops-suppressor",
  name: "OPS Suppressor",
  cat: "muzzle",
  price: 9448,
  stats: {
   "Control": 10,
   "Handling": -8,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/OPSSuppressor_e1e334f1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/OPS%20Suppressor"
 },
 {
  id: "pbs-russian-suppressor",
  name: "PBS Russian Suppressor",
  cat: "muzzle",
  price: 44337,
  stats: {
   "Control": 10,
   "Handling": -13
  },
  traits: [
   "Weak Gunshot",
   "Extra Horizontal Recoil"
  ],
  img: "https://static.deltaforcetools.gg/images/PBSRussianSuppressor_61892652.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PBS%20Russian%20Suppressor"
 },
 {
  id: "poseidon-flash-hider",
  name: "Poseidon Flash Hider",
  cat: "muzzle",
  price: 36279,
  stats: {
   "Control": 7
  },
  traits: [
   "Muzzle Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/PoseidonFlashHider_34b7b009.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Poseidon%20Flash%20Hider"
 },
 {
  id: "practical-flash-hider",
  name: "Practical Flash Hider",
  cat: "muzzle",
  price: 3288,
  stats: {
   "Control": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PracticalFlashHider_0145af85.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Flash%20Hider"
 },
 {
  id: "practical-pistol-flash-hider",
  name: "Practical Pistol Flash Hider",
  cat: "muzzle",
  price: 3137,
  stats: {
   "Control": 3
  },
  traits: [
   "Muzzle Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/PracticalPistolFlash_e3e92abc.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Pistol%20Flash%20Hider"
 },
 {
  id: "practical-suppressor",
  name: "Practical Suppressor",
  cat: "muzzle",
  price: 14442,
  stats: {
   "Control": -2,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/PracticalSuppressor_b899764e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Suppressor"
 },
 {
  id: "purifica-pistol-suppressor",
  name: "Purifica Pistol Suppressor",
  cat: "muzzle",
  price: 13576,
  stats: {
   "Handling": -8,
   "Stability": -4
  },
  traits: [
   "High Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/PurificaPistolSuppre_a31749e0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Purifica%20Pistol%20Suppressor"
 },
 {
  id: "resonant-sniper-rifle-suppressor",
  name: "Resonant Sniper Rifle Suppressor",
  cat: "muzzle",
  price: 168220,
  stats: {
   "Range": 5,
   "Handling": -9,
   "Stability": -6
  },
  traits: [
   "High Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/ResonantSniperRifleS_24c09a49.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Resonant%20Sniper%20Rifle%20Suppressor"
 },
 {
  id: "russian-smg-precision-suppressor",
  name: "Russian SMG Precision Suppressor",
  cat: "muzzle",
  price: 21131,
  stats: {
   "Handling": -6,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot",
   "Extra Horizontal Recoil"
  ],
  img: "https://static.deltaforcetools.gg/images/RussianSMGPrecisionS_f1bb01f6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Russian%20SMG%20Precision%20Suppressor"
 },
 {
  id: "smg-echo-suppressor",
  name: "SMG Echo Suppressor",
  cat: "muzzle",
  price: 92286,
  stats: {
   "Range": 7,
   "Control": 7,
   "Handling": -10,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/SMGEchoSuppressor_0e698a7a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG%20Echo%20Suppressor"
 },
 {
  id: "sr-3m-stealth-suppressor",
  name: "SR-3M Stealth Suppressor",
  cat: "muzzle",
  price: 34620,
  stats: {
   "Range": 5,
   "Control": 5,
   "Handling": -5,
   "Stability": -4
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/SR3MStealthSuppresso_6efe7439.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-3M%20Stealth%20Suppressor"
 },
 {
  id: "sandstorm-vertical-compensator",
  name: "Sandstorm Vertical Compensator",
  cat: "muzzle",
  price: 51413,
  stats: {},
  traits: [
   "Extra Vertical Recoil",
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/SandstormVerticalCom_da57fe01.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Sandstorm%20Vertical%20Compensator"
 },
 {
  id: "shotgun-cage-compensator",
  name: "Shotgun Cage Compensator",
  cat: "muzzle",
  price: 14926,
  stats: {
   "Control": 12,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ShotgunCageCompensat_af426655.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shotgun%20Cage%20Compensator"
 },
 {
  id: "shotgun-cannon-muzzle-brake",
  name: "Shotgun Cannon Muzzle Brake",
  cat: "muzzle",
  price: 27815,
  stats: {
   "Control": 20,
   "Handling": -2,
   "Stability": -2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ShotgunCannonMuzzleB_e212c589.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shotgun%20Cannon%20Muzzle%20Brake"
 },
 {
  id: "shotgun-echo-suppressor",
  name: "Shotgun Echo Suppressor",
  cat: "muzzle",
  price: 23284,
  stats: {
   "Control": 8,
   "Handling": -8,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot",
   "Aiming Spread"
  ],
  img: "https://static.deltaforcetools.gg/images/ShotgunEchoSuppresso_49729dc1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shotgun%20Echo%20Suppressor"
 },
 {
  id: "shotgun-practical-choke",
  name: "Shotgun Practical Choke",
  cat: "muzzle",
  price: 1248,
  stats: {
   "Control": 5,
   "Accuracy": 4,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ShotgunPracticalChok_33aef20c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shotgun%20Practical%20Choke"
 },
 {
  id: "shotgun-precision-suppressor",
  name: "Shotgun Precision Suppressor",
  cat: "muzzle",
  price: 14595,
  stats: {
   "Control": 5,
   "Handling": -4,
   "Stability": -2
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/ShotgunPrecisionSupp_6d0d3d88.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shotgun%20Precision%20Suppressor"
 },
 {
  id: "shotgun-vortex-choke",
  name: "Shotgun Vortex Choke",
  cat: "muzzle",
  price: 48094,
  stats: {
   "Control": 15,
   "Accuracy": 8,
   "Handling": -7
  },
  traits: [
   "Aiming Spread"
  ],
  img: "https://static.deltaforcetools.gg/images/ShotgunVortexChoke_3b7b999c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shotgun%20Vortex%20Choke"
 },
 {
  id: "silent-suppressor",
  name: "Silent Suppressor",
  cat: "muzzle",
  price: 22322,
  stats: {
   "Handling": -13,
   "Stability": -5
  },
  traits: [
   "Range",
   "High Gunshot",
   "Extra Single",
   "Fire Rate"
  ],
  img: "https://static.deltaforcetools.gg/images/SilentSuppressor_0d09e135.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Silent%20Suppressor"
 },
 {
  id: "spiral-fire-flash-hider",
  name: "Spiral Fire Flash Hider",
  cat: "muzzle",
  price: 24734,
  stats: {
   "Stability": 1
  },
  traits: [
   "Muzzle Flash",
   "Extra Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/SpiralFireFlashHider_99676388.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Spiral%20Fire%20Flash%20Hider"
 },
 {
  id: "steel-muzzle-brake",
  name: "Steel Muzzle Brake",
  cat: "muzzle",
  price: 9166,
  stats: {
   "Control": 6,
   "Stability": -1
  },
  traits: [
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/SteelMuzzleBrake_bcda5700.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Steel%20Muzzle%20Brake"
 },
 {
  id: "titan-compensator",
  name: "Titan Compensator",
  cat: "muzzle",
  price: 36469,
  stats: {
   "Control": 16,
   "Handling": -4,
   "Stability": -3
  },
  traits: [
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/TitanCompensator_da4776f7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Titan%20Compensator"
 },
 {
  id: "titan-suppressor",
  name: "Titan Suppressor",
  cat: "muzzle",
  price: 52602,
  stats: {
   "Control": 10,
   "Handling": -8,
   "Stability": -3
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/TitanSuppressor_6cac53d4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Titan%20Suppressor"
 },
 {
  id: "titanium-contest-muzzle-brake",
  name: "Titanium Contest Muzzle Brake",
  cat: "muzzle",
  price: 43730,
  stats: {
   "Control": 12,
   "Handling": -3
  },
  traits: [
   "Blinding Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/TitaniumContestMuzzl_5cdf0617.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Titanium%20Contest%20Muzzle%20Brake"
 },
 {
  id: "vortex-flash-hider",
  name: "Vortex Flash Hider",
  cat: "muzzle",
  price: 20129,
  stats: {
   "Control": 2,
   "Stability": 5,
   "Handling": -2
  },
  traits: [
   "Muzzle Flash"
  ],
  img: "https://static.deltaforcetools.gg/images/VortexFlashHider_6f620281.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vortex%20Flash%20Hider"
 },
 {
  id: "whisper-tactical-suppressor",
  name: "Whisper Tactical Suppressor",
  cat: "muzzle",
  price: 43730,
  stats: {
   "Range": 5,
   "Control": 5,
   "Handling": -5,
   "Stability": -4
  },
  traits: [
   "Weak Gunshot"
  ],
  img: "https://static.deltaforcetools.gg/images/WhisperTacticalSuppr_fdb82e7a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Whisper%20Tactical%20Suppressor"
 },
 {
  id: "3-7-adjustable-scope",
  name: "3/7 Adjustable Scope",
  cat: "optic",
  price: 73409,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Multiple Optical",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/37AdjustableScope_c6d775a6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/3%2F7%20Adjustable%20Scope"
 },
 {
  id: "6-12-expert-sniper-scope",
  name: "6/12 Expert Sniper Scope",
  cat: "optic",
  price: 81482,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Multiple Optical",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/612ExpertSniperScope_884184c5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/6%2F12%20Expert%20Sniper%20Scope"
 },
 {
  id: "acog-precision-6x-scope",
  name: "ACOG Precision 6x Scope",
  cat: "optic",
  price: 18228,
  stats: {
   "Handling": -2
  },
  traits: [
   "Moderate Optical",
   "Weak Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/ACOGPrecision6xScope_f72d0b9d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ACOG%20Precision%206x%20Scope"
 },
 {
  id: "ap5000-reflex-sight",
  name: "AP5000 Reflex Sight",
  cat: "optic",
  price: 5278,
  stats: {
   "Handling": -2
  },
  traits: [
   "Red Dot"
  ],
  img: "https://static.deltaforcetools.gg/images/AP5000ReflexSight_955724c4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AP5000%20Reflex%20Sight"
 },
 {
  id: "cobra-accuracy-sight",
  name: "Cobra Accuracy Sight",
  cat: "optic",
  price: 13056,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/CobraAccuracySight_481a97ad.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Cobra%20Accuracy%20Sight"
 },
 {
  id: "combat-red-dot-sight",
  name: "Combat Red Dot Sight",
  cat: "optic",
  price: 12814,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/CombatRedDotSight_94533cd7.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Combat%20Red%20Dot%20Sight"
 },
 {
  id: "hamr-combined-scope",
  name: "HAMR Combined Scope",
  cat: "optic",
  price: 38973,
  stats: {
   "Handling": -6
  },
  traits: [
   "Moderate Optical",
   "Adjustable Scope"
  ],
  img: "https://static.deltaforcetools.gg/images/HAMRCombinedScope_233706a8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/HAMR%20Combined%20Scope"
 },
 {
  id: "holographic-sight",
  name: "Holographic Sight",
  cat: "optic",
  price: 5014,
  stats: {
   "Handling": -2
  },
  traits: [
   "Red Dot"
  ],
  img: "https://static.deltaforcetools.gg/images/HolographicSight_38affd55.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Holographic%20Sight"
 },
 {
  id: "holographic-sight-type-ii",
  name: "Holographic Sight Type II",
  cat: "optic",
  price: 5128,
  stats: {
   "Handling": -2
  },
  traits: [
   "Red Dot"
  ],
  img: "https://static.deltaforcetools.gg/images/HolographicSightType_a46cc0b3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Holographic%20Sight%20Type%20II"
 },
 {
  id: "insight-3-7-sniper-scope",
  name: "Insight 3/7 Sniper Scope",
  cat: "optic",
  price: 79307,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Active Trajectory",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/Insight37SniperScope_b61ad70e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Insight%203%2F7%20Sniper%20Scope"
 },
 {
  id: "insight-6-12-sniper-scope",
  name: "Insight 6/12 Sniper Scope",
  cat: "optic",
  price: 113242,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Active Trajectory",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/Insight612SniperScop_b19d9591.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Insight%206%2F12%20Sniper%20Scope"
 },
 {
  id: "lpvo-scope",
  name: "LPVO Scope",
  cat: "optic",
  price: 33894,
  stats: {
   "Handling": -6
  },
  traits: [
   "High Optical",
   "Multiple Optical",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/LPVOScope_00ee7239.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/LPVO%20Scope"
 },
 {
  id: "m3-sniper-scope",
  name: "M3 Sniper Scope",
  cat: "optic",
  price: 75792,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/M3SniperScope_b8f6b374.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M3%20Sniper%20Scope"
 },
 {
  id: "micro-sight-riser",
  name: "Micro Sight Riser",
  cat: "optic",
  price: 17322,
  stats: {
   "Handling": 2
  },
  traits: [
   "Extra Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/MicroSightRiser_52acad9c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Micro%20Sight%20Riser"
 },
 {
  id: "mini-red-dot-sight",
  name: "Mini Red Dot Sight",
  cat: "optic",
  price: 12812,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/MiniRedDotSight_87ef4db8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Mini%20Red%20Dot%20Sight"
 },
 {
  id: "multi-purpose-tactical-riser",
  name: "Multi-Purpose Tactical Riser",
  cat: "optic",
  price: 20735,
  stats: {
   "Handling": 2
  },
  traits: [
   "Extra Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/MultiPurposeTactical_64d1d734.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Multi-Purpose%20Tactical%20Riser"
 },
 {
  id: "okp-7-reflex-sight",
  name: "OKP-7 Reflex Sight",
  cat: "optic",
  price: 10544,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/OKP7ReflexSight_c2b9a207.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/OKP-7%20Reflex%20Sight"
 },
 {
  id: "osight-red-dot",
  name: "OSIGHT Red Dot",
  cat: "optic",
  price: 21310,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/OSIGHTRedDot_da03ea63.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/OSIGHT%20Red%20Dot"
 },
 {
  id: "offset-combat-red-dot-sight",
  name: "Offset Combat Red Dot Sight",
  cat: "optic",
  price: 22124,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight",
   "Able to"
  ],
  img: "https://static.deltaforcetools.gg/images/OffsetCombatRedDotSi_3ae9e602.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Offset%20Combat%20Red%20Dot%20Sight"
 },
 {
  id: "offset-mini-red-dot-sight",
  name: "Offset Mini Red Dot Sight",
  cat: "optic",
  price: 21268,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight",
   "Able to"
  ],
  img: "https://static.deltaforcetools.gg/images/OffsetMiniRedDotSigh_79632b9a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Offset%20Mini%20Red%20Dot%20Sight"
 },
 {
  id: "offset-osight-red-dot",
  name: "Offset OSIGHT Red Dot",
  cat: "optic",
  price: 45066,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight",
   "Able to"
  ],
  img: "https://static.deltaforcetools.gg/images/OffsetOSIGHTRedDot_00694e06.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Offset%20OSIGHT%20Red%20Dot"
 },
 {
  id: "offset-panoramic-red-dot-sight",
  name: "Offset Panoramic Red Dot Sight",
  cat: "optic",
  price: 27989,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight",
   "Able to"
  ],
  img: "https://static.deltaforcetools.gg/images/OffsetPanoramicRedDo_ea1f0fde.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Offset%20Panoramic%20Red%20Dot%20Sight"
 },
 {
  id: "offset-xro-quick-response-sight",
  name: "Offset XRO Quick Response Sight",
  cat: "optic",
  price: 21246,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight",
   "Able to"
  ],
  img: "https://static.deltaforcetools.gg/images/OffsetXROQuickRespon_5b9c62b1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Offset%20XRO%20Quick%20Response%20Sight"
 },
 {
  id: "optical-sniper-8x-scope",
  name: "Optical Sniper 8x Scope",
  cat: "optic",
  price: 41038,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/OpticalSniper8xScope_0c2113ca.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Optical%20Sniper%208x%20Scope"
 },
 {
  id: "pso-battle-2-5x-scope",
  name: "PSO Battle 2.5x Scope",
  cat: "optic",
  price: 15384,
  stats: {
   "Handling": -6
  },
  traits: [
   "Moderate Optical"
  ],
  img: "https://static.deltaforcetools.gg/images/PSOBattle25xScope_7613fb2c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PSO%20Battle%202%24%7Bpoint%7D5x%20Scope"
 },
 {
  id: "pso-sniper-8x-scope",
  name: "PSO Sniper 8x Scope",
  cat: "optic",
  price: 10421,
  stats: {
   "Stability": 2,
   "Handling": -8
  },
  traits: [
   "High Optical",
   "Moderate Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/PSOSniper8xScope_6a59c66a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PSO%20Sniper%208x%20Scope"
 },
 {
  id: "panoramic-red-dot-sight",
  name: "Panoramic Red Dot Sight",
  cat: "optic",
  price: 24916,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/PanoramicRedDotSight_9218066b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Panoramic%20Red%20Dot%20Sight"
 },
 {
  id: "recon-1-5-5-adjustable-scope",
  name: "Recon 1.5/5 Adjustable Scope",
  cat: "optic",
  price: 60556,
  stats: {
   "Stability": 6,
   "Handling": -8
  },
  traits: [
   "Moderate Optical",
   "Adjustable Scope",
   "Weak Glint"
  ],
  img: "https://static.deltaforcetools.gg/images/Recon155AdjustableSc_febbe065.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Recon%201%24%7Bpoint%7D5%2F5%20Adjustable%20Scope"
 },
 {
  id: "reflex-sight",
  name: "Reflex Sight",
  cat: "optic",
  price: 5012,
  stats: {
   "Handling": -2
  },
  traits: [
   "Red Dot"
  ],
  img: "https://static.deltaforcetools.gg/images/ReflexSight_f38f2fb0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Reflex%20Sight"
 },
 {
  id: "russian-accuracy-2x-scope",
  name: "Russian Accuracy 2x Scope",
  cat: "optic",
  price: 11385,
  stats: {
   "Handling": -2
  },
  traits: [
   "Red Dot"
  ],
  img: "https://static.deltaforcetools.gg/images/RussianAccuracy2xSco_cac64f80.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Russian%20Accuracy%202x%20Scope"
 },
 {
  id: "viewpoint-3x-scope",
  name: "Viewpoint 3x Scope",
  cat: "optic",
  price: 50235,
  stats: {
   "Handling": -4
  },
  traits: [
   "Moderate Optical"
  ],
  img: "https://static.deltaforcetools.gg/images/Viewpoint3xScope_21a796af.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Viewpoint%203x%20Scope"
 },
 {
  id: "xcog-assault-3-5x-scope",
  name: "XCOG Assault 3.5x Scope",
  cat: "optic",
  price: 45981,
  stats: {
   "Handling": -4
  },
  traits: [
   "Moderate Optical"
  ],
  img: "https://static.deltaforcetools.gg/images/XCOGAssault35xScope_de594611.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/XCOG%20Assault%203%24%7Bpoint%7D5x%20Scope"
 },
 {
  id: "xro-quick-response-sight",
  name: "XRO Quick Response Sight",
  cat: "optic",
  price: 16146,
  stats: {
   "Handling": -2
  },
  traits: [
   "Clean Sight"
  ],
  img: "https://static.deltaforcetools.gg/images/XROQuickResponseSigh_3ade6226.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/XRO%20Quick%20Response%20Sight"
 },
 {
  id: "357-revolver-zephyr-rear-grip",
  name: ".357 Revolver Zephyr Rear Grip",
  cat: "rear grip",
  price: 14942,
  stats: {
   "Handling": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/357RevolverZephyrRea_541d2ffb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/${point}357%20Revolver%20Zephyr%20Rear%20Grip"
 },
 {
  id: "416-practical-rear-grip",
  name: "416 Practical Rear Grip",
  cat: "rear grip",
  price: 3370,
  stats: {
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/416PracticalRearGrip_4007a926.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/416%20Practical%20Rear%20Grip"
 },
 {
  id: "ak-heavy-tower-grip",
  name: "AK Heavy Tower Grip",
  cat: "rear grip",
  price: 50250,
  stats: {
   "Control": 1,
   "Handling": 1,
   "Stability": 1,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKHeavyTowerGrip_43c2d435.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Heavy%20Tower%20Grip"
 },
 {
  id: "ak-marksman-rear-grip",
  name: "AK Marksman Rear Grip",
  cat: "rear grip",
  price: 11600,
  stats: {
   "Stability": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKMarksmanRearGrip_a94c936a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Marksman%20Rear%20Grip"
 },
 {
  id: "ak-practical-rear-grip",
  name: "AK Practical Rear Grip",
  cat: "rear grip",
  price: 10367,
  stats: {
   "Control": 2,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKPracticalRearGrip_0e1b7d0f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Practical%20Rear%20Grip"
 },
 {
  id: "ak-stable-rear-grip",
  name: "AK Stable Rear Grip",
  cat: "rear grip",
  price: 12735,
  stats: {
   "Control": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKStableRearGrip_0845ae48.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Stable%20Rear%20Grip"
 },
 {
  id: "ar-heavy-tower-grip",
  name: "AR Heavy Tower Grip",
  cat: "rear grip",
  price: 48948,
  stats: {
   "Control": 1,
   "Handling": 1,
   "Stability": 1,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ARHeavyTowerGrip_19e572de.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AR%20Heavy%20Tower%20Grip"
 },
 {
  id: "balanced-grip-base",
  name: "Balanced Grip Base",
  cat: "rear grip",
  price: 21770,
  stats: {
   "Control": 1,
   "Handling": 1,
   "Stability": 1,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/BalancedGripBase_1bec06a9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Balanced%20Grip%20Base"
 },
 {
  id: "desert-eagle-competition-rear-grip",
  name: "Desert Eagle Competition Rear Grip",
  cat: "rear grip",
  price: 7941,
  stats: {
   "Control": 6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/DesertEagleCompetiti_da911dc5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Desert%20Eagle%20Competition%20Rear%20Grip"
 },
 {
  id: "g3-rear-grip",
  name: "G3 Rear Grip",
  cat: "rear grip",
  price: 18598,
  stats: {
   "Control": 2,
   "Handling": 2,
   "Stability": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3RearGrip_fec1f424.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Rear%20Grip"
 },
 {
  id: "hurricane-d-1-rear-grip",
  name: "Hurricane D-1 Rear Grip",
  cat: "rear grip",
  price: 12546,
  stats: {
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/HurricaneD1RearGrip_59688a1c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Hurricane%20D-1%20Rear%20Grip"
 },
 {
  id: "invasion-rear-grip",
  name: "Invasion Rear Grip",
  cat: "rear grip",
  price: 32316,
  stats: {
   "Control": 3,
   "Handling": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/InvasionRearGrip_790625cb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Invasion%20Rear%20Grip"
 },
 {
  id: "m1911-nighthawk-tactical-rear-grip",
  name: "M1911 Nighthawk Tactical Rear Grip",
  cat: "rear grip",
  price: 5827,
  stats: {
   "Control": 2,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M1911NighthawkTactic_1988e4f3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M1911%20Nighthawk%20Tactical%20Rear%20Grip"
 },
 {
  id: "m7-stable-rear-grip",
  name: "M7 Stable Rear Grip",
  cat: "rear grip",
  price: 3466,
  stats: {
   "Control": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M7StableRearGrip_3b7cceb2.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M7%20Stable%20Rear%20Grip"
 },
 {
  id: "m9-black-balanced-rear-grip",
  name: "M9 Black Balanced Rear Grip",
  cat: "rear grip",
  price: 5476,
  stats: {
   "Control": 3,
   "Handling": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M9BlackBalancedRearG_bf62d9c1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M9%20Black%20Balanced%20Rear%20Grip"
 },
 {
  id: "m9-carneose-stable-rear-grip",
  name: "M9 Carneose Stable Rear Grip",
  cat: "rear grip",
  price: 5006,
  stats: {
   "Control": 2,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M9CarneoseStableRear_a9a5404b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M9%20Carneose%20Stable%20Rear%20Grip"
 },
 {
  id: "mp7-balanced-rear-grip",
  name: "MP7 Balanced Rear Grip",
  cat: "rear grip",
  price: 52441,
  stats: {
   "Control": 2,
   "Handling": 2,
   "Stability": 2,
   "Accuracy": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP7BalancedRearGrip_0156887f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%20Balanced%20Rear%20Grip"
 },
 {
  id: "mp7-stable-rear-grip",
  name: "MP7 Stable Rear Grip",
  cat: "rear grip",
  price: 42658,
  stats: {
   "Control": 6,
   "Stability": 6,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP7StableRearGrip_a973d484.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%20Stable%20Rear%20Grip"
 },
 {
  id: "marksman-d-2-rear-grip",
  name: "Marksman D-2 Rear Grip",
  cat: "rear grip",
  price: 13978,
  stats: {
   "Stability": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MarksmanD2RearGrip_c3f155f5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Marksman%20D-2%20Rear%20Grip"
 },
 {
  id: "psg-1-rear-grip",
  name: "PSG-1 Rear Grip",
  cat: "rear grip",
  price: 15556,
  stats: {
   "Control": 2,
   "Stability": 6,
   "Handling": -2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PSG1RearGrip_20d85f7e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PSG-1%20Rear%20Grip"
 },
 {
  id: "phantom-rear-grip",
  name: "Phantom Rear Grip",
  cat: "rear grip",
  price: 111185,
  stats: {
   "Control": 3,
   "Handling": 9,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PhantomRearGrip_d34fdcbf.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Phantom%20Rear%20Grip"
 },
 {
  id: "rk-3-rear-grip",
  name: "RK-3 Rear Grip",
  cat: "rear grip",
  price: 22058,
  stats: {
   "Control": 3,
   "Handling": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/RK3RearGrip_cb123f16.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/RK-3%20Rear%20Grip"
 },
 {
  id: "resonant-2-integral-stock",
  name: "Resonant 2 Integral Stock",
  cat: "rear grip",
  price: 129221,
  stats: {
   "Control": 7,
   "Accuracy": 4,
   "Stability": -6
  },
  traits: [
   "Extra ADS",
   "ADS Speed"
  ],
  img: "https://static.deltaforcetools.gg/images/Resonant2IntegralSto_5f1a8e7b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Resonant%202%20Integral%20Stock"
 },
 {
  id: "restricted-zone-integral-stock",
  name: "Restricted Zone Integral Stock",
  cat: "rear grip",
  price: 102956,
  stats: {
   "Control": 11,
   "Stability": 7,
   "Handling": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/RestrictedZoneIntegr_3fd799a9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Restricted%20Zone%20Integral%20Stock"
 },
 {
  id: "revolver-sniper-rear-grip",
  name: "Revolver Sniper Rear Grip",
  cat: "rear grip",
  price: 5568,
  stats: {
   "Stability": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/RevolverSniperRearGr_fc782bf1.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Revolver%20Sniper%20Rear%20Grip"
 },
 {
  id: "svd-grip-adapter",
  name: "SVD Grip Adapter",
  cat: "rear grip",
  price: 7502,
  stats: {
   "Handling": 1
  },
  traits: [
   "Adds: Modification"
  ],
  img: "https://static.deltaforcetools.gg/images/SVDGripAdapter_d5555332.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%20Grip%20Adapter"
 },
 {
  id: "svd-polymer-integral-stock",
  name: "SVD Polymer Integral Stock",
  cat: "rear grip",
  price: 44050,
  stats: {
   "Stability": 8,
   "Handling": -4
  },
  traits: [
   "Extra Single"
  ],
  img: "https://static.deltaforcetools.gg/images/SVDPolymerIntegralSt_de1bca9f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SVD%20Polymer%20Integral%20Stock"
 },
 {
  id: "scorpio-rear-grip",
  name: "Scorpio Rear Grip",
  cat: "rear grip",
  price: 70426,
  stats: {
   "Control": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ScorpioRearGrip_de786d4e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Scorpio%20Rear%20Grip"
 },
 {
  id: "stable-grip-base",
  name: "Stable Grip Base",
  cat: "rear grip",
  price: 23999,
  stats: {
   "Control": 2,
   "Stability": 7,
   "Handling": -5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/StableGripBase_e2e062ef.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Stable%20Grip%20Base"
 },
 {
  id: "xk-anti-slip-rear-grip",
  name: "XK Anti-Slip Rear Grip",
  cat: "rear grip",
  price: 9297,
  stats: {
   "Control": 2,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/XKAntiSlipRearGrip_00c6b0ab.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/XK%20Anti-Slip%20Rear%20Grip"
 },
 {
  id: "xk-competition-rear-grip",
  name: "XK Competition Rear Grip",
  cat: "rear grip",
  price: 21846,
  stats: {
   "Control": 6,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/XKCompetitionRearGri_ea15698b.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/XK%20Competition%20Rear%20Grip"
 },
 {
  id: "xk-rubber-coated-rear-grip",
  name: "XK Rubber Coated Rear Grip",
  cat: "rear grip",
  price: 9716,
  stats: {
   "Control": 4,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/XKRubberCoatedRearGr_631c4c3d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/XK%20Rubber%20Coated%20Rear%20Grip"
 },
 {
  id: "357-revolver-zephyr-stock",
  name: ".357 Revolver Zephyr Stock",
  cat: "stock",
  price: 13752,
  stats: {
   "Stability": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/357RevolverZephyrSto_ecebab63.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/%24%7Bpoint%7D357%20Revolver%20Zephyr%20Stock"
 },
 {
  id: "1014-collapsible-stock-extended",
  name: "1014 Collapsible Stock (Extended)",
  cat: "stock",
  price: 71303,
  stats: {
   "Control": 15,
   "Accuracy": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/1014CollapsibleStock_10f388e4.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/1014%20Collapsible%20Stock%20(Extended)"
 },
 {
  id: "1014-collapsible-stock-folded",
  name: "1014 Collapsible Stock (Folded)",
  cat: "stock",
  price: 40767,
  stats: {
   "Control": 5,
   "Handling": 8,
   "Accuracy": 12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/1014CollapsibleStock_ddc9178e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/1014%20Collapsible%20Stock%20(Folded)"
 },
 {
  id: "1014-fixed-stock",
  name: "1014 Fixed Stock",
  cat: "stock",
  price: 17743,
  stats: {
   "Control": 8,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/1014FixedStock_8b0d4867.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/1014%20Fixed%20Stock"
 },
 {
  id: "416-light-stock",
  name: "416 Light Stock",
  cat: "stock",
  price: 23612,
  stats: {
   "Control": 6,
   "Handling": 6,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/416LightStock_adbfd586.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/416%20Light%20Stock"
 },
 {
  id: "416-stable-stock",
  name: "416 Stable Stock",
  cat: "stock",
  price: 33119,
  stats: {
   "Control": 4,
   "Stability": 8,
   "Handling": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/416StableStock_4bf3f318.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/416%20Stable%20Stock"
 },
 {
  id: "416-c-collapsible-stock",
  name: "416-C Collapsible Stock",
  cat: "stock",
  price: 32988,
  stats: {
   "Control": 4,
   "Handling": 8,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/416CCollapsibleStock_71274aca.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/416-C%20Collapsible%20Stock"
 },
 {
  id: "ak-bolt-cover",
  name: "AK Bolt Cover",
  cat: "stock",
  price: 1784,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKBoltCover_b1f17124.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Bolt%20Cover"
 },
 {
  id: "ak-folding-stock",
  name: "AK Folding Stock",
  cat: "stock",
  price: 12661,
  stats: {
   "Handling": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKFoldingStock_4ac6c254.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Folding%20Stock"
 },
 {
  id: "ak-polymer-stock",
  name: "AK Polymer Stock",
  cat: "stock",
  price: 3460,
  stats: {
   "Control": 1,
   "Stability": 1
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKPolymerStock_c1b5b242.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Polymer%20Stock"
 },
 {
  id: "ak-skeleton-stock",
  name: "AK Skeleton Stock",
  cat: "stock",
  price: 3116,
  stats: {
   "Handling": 8,
   "Control": -3,
   "Stability": -3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKSkeletonStock_16c61ca5.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Skeleton%20Stock"
 },
 {
  id: "ak-stock-recoil-pad",
  name: "AK Stock Recoil Pad",
  cat: "stock",
  price: 2226,
  stats: {
   "Control": 3,
   "Stability": 1,
   "Handling": -3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AKStockRecoilPad_af6a1a57.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK%20Stock%20Recoil%20Pad"
 },
 {
  id: "ak-19-stock",
  name: "AK-19 Stock",
  cat: "stock",
  price: 23947,
  stats: {
   "Handling": 4,
   "Stability": -2,
   "Accuracy": -8
  },
  traits: [
   "Extra: Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/AK19Stock_88fd30bf.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AK-19%20Stock"
 },
 {
  id: "as-val-bolt-cover",
  name: "AS Val Bolt Cover",
  cat: "stock",
  price: 7509,
  stats: {
   "Handling": 12,
   "Accuracy": 3,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ASValBoltCover_20cdab9d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AS%20Val%20Bolt%20Cover"
 },
 {
  id: "ash-12-skeleton-stock",
  name: "ASh-12 Skeleton Stock",
  cat: "stock",
  price: 105544,
  stats: {
   "Control": 4,
   "Handling": 12
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ASh12SkeletonStock_1d90f865.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ASh-12%20Skeleton%20Stock"
 },
 {
  id: "ash-12-sniper-stock",
  name: "ASh-12 Sniper Stock",
  cat: "stock",
  price: 85788,
  stats: {
   "Control": 12,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ASh12SniperStock_09a18908.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/ASh-12%20Sniper%20Stock"
 },
 {
  id: "aug-stock-pad",
  name: "AUG Stock Pad",
  cat: "stock",
  price: 71534,
  stats: {
   "Control": 4,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/AUGStockPad_125f8035.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/AUG%20Stock%20Pad"
 },
 {
  id: "cardinal-advanced-combat-stock",
  name: "Cardinal Advanced Combat Stock",
  cat: "stock",
  price: 50493,
  stats: {
   "Control": 4,
   "Handling": 1,
   "Stability": 1,
   "Accuracy": 8
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/CardinalAdvancedComb_c2d1f0c3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Cardinal%20Advanced%20Combat%20Stock"
 },
 {
  id: "cardinal-stable-stock",
  name: "Cardinal Stable Stock",
  cat: "stock",
  price: 23002,
  stats: {},
  traits: [
   "Extra Firing"
  ],
  img: "https://static.deltaforcetools.gg/images/CardinalStableStock_13b323e6.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Cardinal%20Stable%20Stock"
 },
 {
  id: "core-rail-stock",
  name: "Core Rail Stock",
  cat: "stock",
  price: 10856,
  stats: {
   "Control": 2,
   "Handling": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/CoreRailStock_71cdc334.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Core%20Rail%20Stock"
 },
 {
  id: "elite-light-stock",
  name: "Elite Light Stock",
  cat: "stock",
  price: 16291,
  stats: {
   "Control": 3
  },
  traits: [
   "Extra ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/EliteLightStock_d74021e9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Elite%20Light%20Stock"
 },
 {
  id: "g3-collapsible-stock",
  name: "G3 Collapsible Stock",
  cat: "stock",
  price: 3134,
  stats: {
   "Control": 1,
   "Handling": 3,
   "Stability": -2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3CollapsibleStock_bb1cf1fc.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Collapsible%20Stock"
 },
 {
  id: "g3-stable-stock",
  name: "G3 Stable Stock",
  cat: "stock",
  price: 12943,
  stats: {
   "Control": 5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3StableStock_e854c33d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Stable%20Stock"
 },
 {
  id: "g3-stock",
  name: "G3 Stock",
  cat: "stock",
  price: 13180,
  stats: {
   "Handling": 2,
   "Stability": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/G3Stock_56dec151.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/G3%20Stock"
 },
 {
  id: "invasion-core-stock",
  name: "Invasion Core Stock",
  cat: "stock",
  price: 22432,
  stats: {
   "Control": 6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/InvasionCoreStock_bf634d68.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Invasion%20Core%20Stock"
 },
 {
  id: "lightning-rail-stock",
  name: "Lightning Rail Stock",
  cat: "stock",
  price: 23552,
  stats: {
   "Handling": 12,
   "Stability": -6
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/LightningRailStock_3e9bf71a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Lightning%20Rail%20Stock"
 },
 {
  id: "m14-ebr-stock",
  name: "M14 EBR Stock",
  cat: "stock",
  price: 38176,
  stats: {
   "Control": 5,
   "Handling": 4,
   "Stability": 3,
   "Accuracy": -8
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/M14EBRStock_47a6f8bc.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M14%20EBR%20Stock"
 },
 {
  id: "m16a4-stable-stock",
  name: "M16A4 Stable Stock",
  cat: "stock",
  price: 22968,
  stats: {
   "Control": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M16A4StableStock_ebf8aff3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M16A4%20Stable%20Stock"
 },
 {
  id: "m249-bolt-cover",
  name: "M249 Bolt Cover",
  cat: "stock",
  price: 5927,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M249BoltCover_eab0df3d.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Bolt%20Cover"
 },
 {
  id: "m249-elite-skeleton-stock",
  name: "M249 Elite Skeleton Stock",
  cat: "stock",
  price: 32444,
  stats: {
   "Control": 4,
   "Handling": 9,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/M249EliteSkeletonSto_3a96b732.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M249%20Elite%20Skeleton%20Stock"
 },
 {
  id: "m4-recoil-buffer-tube",
  name: "M4 Recoil Buffer Tube",
  cat: "stock",
  price: 4985,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M4RecoilBufferTube_52f6bb21.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M4%20Recoil%20Buffer%20Tube"
 },
 {
  id: "m700-cheek-pad",
  name: "M700 Cheek Pad",
  cat: "stock",
  price: 16415,
  stats: {
   "Handling": 1,
   "Stability": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/M700CheekPad_f5f2049e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/M700%20Cheek%20Pad"
 },
 {
  id: "mp5-bolt-cover",
  name: "MP5 Bolt Cover",
  cat: "stock",
  price: 3790,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5BoltCover_4e800f0e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%20Bolt%20Cover"
 },
 {
  id: "mp5-retractable-stock",
  name: "MP5 Retractable Stock",
  cat: "stock",
  price: 11333,
  stats: {
   "Handling": 2,
   "Accuracy": 8
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5RetractableStock_f12f36ed.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5%20Retractable%20Stock"
 },
 {
  id: "mp5k-folding-stock",
  name: "MP5K Folding Stock",
  cat: "stock",
  price: 14436,
  stats: {
   "Control": 3,
   "Stability": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP5KFoldingStock_961eb3e0.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP5K%20Folding%20Stock"
 },
 {
  id: "mp7-bolt-cover",
  name: "MP7 Bolt Cover",
  cat: "stock",
  price: 7864,
  stats: {
   "Handling": 12,
   "Accuracy": 3,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/MP7BoltCover_602ecf6c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MP7%20Bolt%20Cover"
 },
 {
  id: "mrgs-skeleton-stock",
  name: "MRGS Skeleton Stock",
  cat: "stock",
  price: 39926,
  stats: {
   "Handling": 4,
   "Stability": 6,
   "Accuracy": -8
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/MRGSSkeletonStock_9cabae84.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/MRGS%20Skeleton%20Stock"
 },
 {
  id: "p90-stock-pad",
  name: "P90 Stock Pad",
  cat: "stock",
  price: 48290,
  stats: {
   "Control": 8,
   "Handling": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/P90StockPad_613d3db8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/P90%20Stock%20Pad"
 },
 {
  id: "pkm-bolt-cover",
  name: "PKM Bolt Cover",
  cat: "stock",
  price: 5658,
  stats: {
   "Handling": 12,
   "Accuracy": 3,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PKMBoltCover_7a047232.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PKM%20Bolt%20Cover"
 },
 {
  id: "pkm-zenitco-stock",
  name: "PKM ZenitCo Stock",
  cat: "stock",
  price: 53069,
  stats: {
   "Control": 5,
   "Handling": 2,
   "Stability": 3,
   "Accuracy": -8
  },
  traits: [
   "Extra ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/PKMZenitCoStock_b8032de9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PKM%20ZenitCo%20Stock"
 },
 {
  id: "pt1-spec-ops-stock",
  name: "PT1 Spec Ops Stock",
  cat: "stock",
  price: 46390,
  stats: {
   "Control": 8,
   "Handling": 4,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PT1SpecOpsStock_3cb4d6a3.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PT1%20Spec%20Ops%20Stock"
 },
 {
  id: "pt3-sacrifice-stock",
  name: "PT3 Sacrifice Stock",
  cat: "stock",
  price: 38410,
  stats: {
   "Control": 3,
   "Handling": 3,
   "Stability": 3,
   "Accuracy": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PT3SacrificeStock_381b7d8a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/PT3%20Sacrifice%20Stock"
 },
 {
  id: "practical-light-stock",
  name: "Practical Light Stock",
  cat: "stock",
  price: 3197,
  stats: {},
  traits: [
   "Extra ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/PracticalLightStock_04d6e44e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Light%20Stock"
 },
 {
  id: "practical-stable-stock",
  name: "Practical Stable Stock",
  cat: "stock",
  price: 3456,
  stats: {
   "Control": 2
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PracticalStableStock_7277c603.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Stable%20Stock"
 },
 {
  id: "practical-tactical-stock",
  name: "Practical Tactical Stock",
  cat: "stock",
  price: 8868,
  stats: {
   "Control": 4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/PracticalTacticalSto_f83a3a9f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Practical%20Tactical%20Stock"
 },
 {
  id: "qbz-cheek-pad",
  name: "QBZ Cheek Pad",
  cat: "stock",
  price: 29252,
  stats: {
   "Control": 3,
   "Handling": 3,
   "Stability": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/QBZCheekPad_15a45788.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/QBZ%20Cheek%20Pad"
 },
 {
  id: "s12k-bump-stock",
  name: "S12K Bump Stock",
  cat: "stock",
  price: 40652,
  stats: {
   "Control": -6,
   "Accuracy": -16
  },
  traits: [
   "Switch to",
   "Aiming Spread"
  ],
  img: "https://static.deltaforcetools.gg/images/S12KBumpStock_5746965e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/S12K%20Bump%20Stock"
 },
 {
  id: "scar-h-bolt-cover",
  name: "SCAR-H Bolt Cover",
  cat: "stock",
  price: 5658,
  stats: {
   "Handling": 12,
   "Accuracy": 3,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SCARHBoltCover_b5da66e8.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SCAR-H%20Bolt%20Cover"
 },
 {
  id: "sg552-bolt-cover",
  name: "SG552 Bolt Cover",
  cat: "stock",
  price: 3641,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SG552BoltCover_a77e5215.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SG552%20Bolt%20Cover"
 },
 {
  id: "smg-45-bolt-cover",
  name: "SMG-45 Bolt Cover",
  cat: "stock",
  price: 3793,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SMG45BoltCover_2ca79c6e.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SMG-45%20Bolt%20Cover"
 },
 {
  id: "sr-3m-bolt-cover",
  name: "SR-3M Bolt Cover",
  cat: "stock",
  price: 5658,
  stats: {
   "Handling": 12,
   "Accuracy": 3,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SR3MBoltCover_3c71f788.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/SR-3M%20Bolt%20Cover"
 },
 {
  id: "shadow-buffer-tube-stock",
  name: "Shadow Buffer Tube Stock",
  cat: "stock",
  price: 46278,
  stats: {
   "Control": 2,
   "Handling": 10,
   "Accuracy": 8,
   "Stability": -6
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/ShadowBufferTubeStoc_9ced9d51.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shadow%20Buffer%20Tube%20Stock"
 },
 {
  id: "shadow-rail-stock",
  name: "Shadow Rail Stock",
  cat: "stock",
  price: 38398,
  stats: {
   "Control": 7,
   "Handling": 7,
   "Stability": -6
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/ShadowRailStock_1cd2fa4f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Shadow%20Rail%20Stock"
 },
 {
  id: "skeleton-sniper-stock",
  name: "Skeleton Sniper Stock",
  cat: "stock",
  price: 39488,
  stats: {
   "Handling": 8,
   "Stability": 6,
   "Control": -4,
   "Accuracy": -16
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/SkeletonSniperStock_3153d98a.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Skeleton%20Sniper%20Stock"
 },
 {
  id: "ur-spec-ops-tactical-stock",
  name: "UR Spec Ops Tactical Stock",
  cat: "stock",
  price: 68658,
  stats: {
   "Control": 8,
   "Stability": 4,
   "Handling": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/URSpecOpsTacticalSto_4a88323c.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UR%20Spec%20Ops%20Tactical%20Stock"
 },
 {
  id: "uzi-bolt-cover",
  name: "UZI Bolt Cover",
  cat: "stock",
  price: 1784,
  stats: {
   "Handling": 12,
   "Accuracy": 3,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UZIBoltCover_b7a9c426.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Bolt%20Cover"
 },
 {
  id: "uzi-stock",
  name: "UZI Stock",
  cat: "stock",
  price: 4026,
  stats: {
   "Control": 2,
   "Handling": 4,
   "Stability": -2
  },
  traits: [
   "Extra: ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/UZIStock_5905ba1f.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/UZI%20Stock"
 },
 {
  id: "universal-cheek-pad",
  name: "Universal Cheek Pad",
  cat: "stock",
  price: 16580,
  stats: {
   "Control": 1,
   "Stability": 3
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/UniversalCheekPad_84c186ac.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Universal%20Cheek%20Pad"
 },
 {
  id: "vss-elite-integral-stock",
  name: "VSS Elite Integral Stock",
  cat: "stock",
  price: 94178,
  stats: {
   "Control": 20,
   "Accuracy": -8
  },
  traits: [
   "Extra ADS"
  ],
  img: "https://static.deltaforcetools.gg/images/VSSEliteIntegralStoc_6b436bcb.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/VSS%20Elite%20Integral%20Stock"
 },
 {
  id: "vector-bolt-cover",
  name: "Vector Bolt Cover",
  cat: "stock",
  price: 7835,
  stats: {
   "Handling": 12,
   "Accuracy": 12,
   "Control": -10,
   "Stability": -4
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VectorBoltCover_51351cc9.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%20Bolt%20Cover"
 },
 {
  id: "vector-resonant-integral-stock",
  name: "Vector Resonant Integral Stock",
  cat: "stock",
  price: 74646,
  stats: {
   "Control": 12,
   "Handling": 6,
   "Accuracy": 12,
   "Stability": -5
  },
  traits: [],
  img: "https://static.deltaforcetools.gg/images/VectorResonantIntegr_5a694044.png",
  wiki: "https://deltaforcetools.gg/wiki/attachment/Vector%20Resonant%20Integral%20Stock"
 }
];

export const ATTACH_BY_CAT: Record<string, Attachment[]> = ATTACHMENTS.reduce(
  (acc, a) => {
    (acc[a.cat] ??= []).push(a);
    return acc;
  },
  {} as Record<string, Attachment[]>,
);

/**
 * Where to look for an attachment's picture, best first.
 *
 * The mirrored copy is same-origin so it always works as a texture; the CDN is
 * tried only if that 404s, and may itself fail on CORS — in which case the card
 * falls back to type alone.
 */
export const attachImageSources = (a: Attachment) => [`att/${a.id}.png`, a.img];
