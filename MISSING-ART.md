# Missing artwork, and missing entries

Audited August 2026. Weapons, maps and operators are all complete now, with
pictures. What is left is thirteen pieces of gear, and there is a reason.

---

# Part one — the gear with no picture

13 of 183 entries. Every one of them is **red or gold armour and carry gear, and
none of it appears on the auction house** — checked against a live recording of
the market. Either it is untradeable, or it is no longer sold. So there is no
market listing to take a picture from, and the only way to get these is an
in-game item card, the same way the guns were done.

The filename is the id plus `.png`. Drop them in `public/gear/`, add the ids to
`tools/gear-local.json`, then `npm run gen:icons && npm run build`.

| file | item | tier | column |
|---|---|---|---|
| `dich-9-heavy-helmet.png` | DICH-9 Heavy Helmet | Red | helmet |
| `gt5-commander-helmet.png` | GT5 Commander Helmet | Red | helmet |
| `adamantine-vest.png` | Adamantine Vest | Red | vest |
| `ha-2-ballistic-vest.png` | HA-2 Ballistic Vest | Red | vest |
| `trek-mas20-vest.png` | Trek MAS2.0 Vest | Red | vest |
| `titan-vest.png` | Titan Vest | Red | vest |
| `nylon-sling-bag.png` | Nylon Sling Bag | Green | chest rig |
| `hurricane-tactical-chest-rig.png` | Hurricane Tactical Chest Rig | Gold | chest rig |
| `black-hawk-field-chest-rig.png` | Black Hawk Field Chest Rig | Gold | chest rig |
| `dar-assault-chest-rig.png` | DAR Assault Chest Rig | Gold | chest rig |
| `pangolin-universal-tactical-backpack.png` | Pangolin Universal Tactical Backpack | Purple | backpack |
| `d7-tactical-backpack.png` | D7 Tactical Backpack | Red | backpack |
| `gto-heavy-tactical-bag.png` | GTO Heavy Tactical Bag | Red | backpack |

An item card screenshot is all that is needed — name plate at the top, item in
the middle. The card furniture gets trimmed and the background cut out
automatically, the same pipeline the 23 guns went through.

## Done

| column | covered |
|---|---|
| Map | 7/7 |
| Operator | 16/16 |
| Primary weapon | 66/66 |
| Helmet | 21/23 |
| Vest | 21/25 |
| Chest rig | 16/20 |
| Backpack | 23/26 |
| **Total** | **170/183** |

---

# Part two — missing from the catalogue entirely

Every list was cross-checked against outside sources. Three real gaps, and two
things that look like gaps but are correctly absent.

## 1. Valkyrie Nuclear Power Plant — a map we do not have

A Season 10 Operations map. It is on the world map screen as **VALKYR**, next to
AZ3, and the app has seven maps without it.

- Modes are documented as **Normal and Confidential** — and Confidential is not
  a tier this app models, so adding it means deciding whether Confidential is
  our `hard`. That decision changes which difficulty rolls it, so it is worth
  getting right rather than assuming.
- Documented entry cost for Confidential is 112,500, which sits in our *normal*
  band (112,500–187,500), not our *hard* band (550,000+). Those two facts point
  in opposite directions.
- An icon for it can be cut from the same video frame AZ3 came from, at the same
  framing.

## 2. Survival Tactical Backpack — a backpack we do not have

Purple tier. Confirmed by two independent sources; one of them files it under
the purple bags and describes it as an awkward layout that cannot seat rifles
cleanly. Our backpack list has 26 and should have 27.

## 3. The Compound Bow has six attachment slots we do not model

The bow is a real Operations weapon and it is in the catalogue, but it does not
take gun parts. Its slots are:

    Bow Limb   Stabilizer   Grip Piece   Bow Sight   Arrow Rest   String

None of those are among our nine, and none of the 414 attachments is a bow part.
So the capsule machine can only ever deal the bow a muzzle brake and a stock.
The stage already says fit is not checked, which covers it — but the bow is the
one weapon where *nothing* it is dealt could ever be right.

## Correctly absent — checked, not gaps

- **Black Site.** It has a marker on the world map and a tab in the top menu,
  which makes it look like a raid. It is the base-progression system — stash,
  workbench, pharmacy and the rest. Not somewhere you deploy.
- **Operation Serpentine.** Also a world-map marker. It is a PVE mission mode
  with its own Normal/Hard/Ultra ladder and a three-a-day cap, not an extraction
  map.

## Found and added since — no longer gaps

- **Nylon Chest Rig.** Green tier, newer than any tier listing that exists.
  Came off its own item card. Chest rigs are now 20.
- **Nine rounds of ammunition** that were on the market and not in the data:
  7.62x51mm Ultra Nosler, 12 Gauge 8.5mm Buckshot, 12 Gauge Dragon’s Breath,
  .45 ACP CT, 5.8x42mm DBP10 +P, 5.8x42mm DVC12 +P, and three arrows —
  Fiberglass Willow, Carbon Fiber Bone-Piercer, Carbon Fiber Armor-Piercing.
  Ammunition is now 85 rounds across 21 calibers.
- **Arrows are ammunition.** The Compound Bow chambers them like any other gun
  chambers a cartridge, so it has a caliber now instead of a null.

## Confirmed complete — nothing missing

- **66 weapons.** Every one confirmed against several sources, and every one now
  has a picture.
- **23 helmets, 25 vests, 20 chest rigs, 26 backpacks.** Matched item for item
  against a tier-by-tier listing, plus the live market.
- **Nine attachment slots.** Exactly the nine the game has. Lasers, lights and
  bipods live inside Functional rather than in slots of their own, which is how
  we have them.
- **21 calibers.** Checked against a recording of the whole auction house. The
  grade of every round already in the file reproduces exactly from the rarity
  tint on its market card — including the pen-0 oddities, where a .45 ACP RIP
  reads blue and a 12 Gauge Slug RIP reads green, which is what this file
  already said.
- **7 maps, 16 operators.**

## Not on the market, so not in that recording

`.338 Lapua Magnum`, `.50 BMG`, `.50 AE AP` and `12 Gauge Slug GT` are in the
data but never appeared in the auction — the same untradeable story as the red
gear above. Their grades are the ones already recorded, not market-checked.

## Worth an in-game glance, not worth acting on

Single-source names with no corroboration anywhere, most likely skins or
mis-parsed rows: **AM-17** (a weapon, and probably a mix-up with a similarly
named gun in another extraction shooter), **Bee Vest**, **Samurai Vest**,
**Canvas Backpack**, **Field Footpack**. If you see any of them in your stash,
they are real and I was wrong to doubt them.
