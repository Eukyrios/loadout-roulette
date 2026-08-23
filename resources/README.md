# Resources

Reference images and working evidence. Nothing here is shipped — `vite` only
copies `public/`, so these add nothing to the bundle.

| file | what it is |
|---|---|
| `settings-panel.png` | The machine's Settings panel as it currently renders, with the picture filter on by default. |
| `control-bar.png` | The bar pinned to the bottom: Animation, Sound, Length, Volume. |
| `ammo-tier-detection.png` | Every ammunition label from a recording of the live auction house, each tagged with the tier read off its own card. This is the evidence behind the grades in `src/data/ammo.ts`: 76 of 76 rounds on the market agree with what the app says. |
| `ammo-tier-detection-before.png` | The same read with a flaw, kept for comparison. |

## How the ammunition grades were checked

The auction card states no penetration figure, only a rarity colour. The colour
is a translucent tint over the card, so it cannot be matched directly — a gold
chip on a dark card is not the gold in the palette. It is read by sampling the
chip, sampling the plain card underneath, and classifying the difference.

Two mistakes were made getting there, both visible in the two images:

1. **Gold read as red.** Comparing hue direction alone could not separate the
   two, and there is no red in the ammunition ladder at all — the top is gold.
   Anything at the top of a caliber came out red until that was ruled out.

2. **Long names read as gray.** The plain-card sample was taken from the right
   of the label, which on a name that fills its chip lands *inside* the chip.
   Both carbon arrows measured as having no tint and defaulted to gray. Taking
   the sample from below the label instead put them right: gold and purple.

What makes the result trustworthy is not the method but the control: the same
read reproduces the grade of every round that was already in the file, from a
different direction, including the pen-0 oddities where a .45 ACP RIP is blue
but a 12 Gauge Slug RIP is green. One round it disagreed with — `45-70 Govt RN`,
which had no published penetration anywhere and was defaulting to gray — turned
out to be the data being wrong, not the read. It is graded blue now.

Ten rounds never appear on the market and cannot be checked this way: the
`.50 BMG` and `.338 Lapua` loads, `.50 AE AP` and `12 Gauge Slug GT` among them.
Their grades are the ones already recorded — untested, not wrong.
