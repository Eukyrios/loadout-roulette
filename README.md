# Loadout Roulette

A two-stage randomizer for **Delta Force: Hawk Ops** Operations runs.

**Stage one** is a 3D roulette wheel. Red pockets are Easy, black are Normal,
green are Hard. Spin it and the ball lands on your difficulty.

**Stage two** is a slot machine. Winning a spin mints a token in the difficulty
you rolled — bronze for Easy, steel for Normal, gold for Hard. Drag it to the
coin slot and pull the lever, and seven reels settle one after another: map,
operator, weapon, helmet, vest, rig, backpack.

**Stage three** is a pair of 3D dice. The white die sets your total loadout
cost cap, the red die sets your attachment cost cap. Low rolls are meant to
hurt.

The difficulty you rolled gates the map reel, so a Hard result can only produce
maps that actually run a Hard tier.

---

## Running it

```bash
npm install
npm run dev      # dev server on :5173
npm run build    # typecheck + production bundle into dist/
npm run preview  # serve the production bundle
npm run smoke    # headless browser test of the whole flow (23 assertions)
```

Deploy `dist/` to any static host. No backend, no analytics.

> The bundle is ~756 kB (205 kB gzipped) because three.js is in it. If that
> matters, lazy-load `RouletteWheel` behind `React.lazy` — it is the only
> module that imports three, so the split is clean.

---

## The loop

| Step | What happens |
| --- | --- |
| Spin the wheel | Ball lands in a pocket. Colour → difficulty. A matching token drops. |
| …or pick a colour | The three legend rows are buttons. Click one to mint that token directly and skip the wheel. |
| Take the token | Drag it to the coin slot. Clicking it or pressing Enter also works. |
| Pull the lever | Drag the knob down past halfway, or just click it. Seven reels stop in order, ~400 ms apart. |
| Throw the dice | Two d6 set the loadout and attachment spending caps. |
| Tweak | Hold, nudge, or re-spin any reel. Free — no token needed. |
| Go again | A fresh full pull costs another token. |

The cabinet's top-right readout shows the **difficulty the inserted token
carries**, not a credit count — the number was never the interesting part, and
the difficulty is what actually constrains the map reel.

Spacebar spins the wheel, or pulls the lever if you have a credit.

**Two separate locks, deliberately.** The per-reel controls unlock once you have
*ever* paid, so you can keep adjusting after a pull. The lever needs an *unspent*
credit, so a full re-roll always costs a token. An earlier version keyed both off
the credit count, which made Hold useless — every pull needed a coin, every coin
needed a wheel spin, and the wheel spin wiped the board.

---

## Project layout

```
src/
  data/
    types.ts        Entry, SlotSpec, FilterSpec, FilterState
    deltaforce.ts   ALL GAME DATA + the wheel layout — the file to edit
    slots.ts        Slot registry: what reels exist, in stop order
  engine/
    rng.ts          Seeded RNG (mulberry32) + weighted picking
    filters.ts      Filter defaults, pool resolution, dependency walk
    roll.ts         The randomizer
    presets.ts      Named filter presets
    persist.ts      Safe localStorage wrapper
    sound.ts        WebAudio blips — no audio files shipped
  three/
    RouletteWheel.tsx   The 3D wheel, plain three.js
    DiceTray.tsx        The 3D dice, plain three.js
  components/
    SlotMachine.tsx     Cabinet, coin slot, lever
    SlotReel.tsx        One vertical reel
    Coin.tsx            The draggable token
    SettingsPanel.tsx
  App.tsx           State machine and layout
```

### Changing the odds

`WHEEL_POCKETS` in `deltaforce.ts` is the wheel, pocket by pocket. The colour
mix *is* the probability model — there is no separate weighting table. It
currently builds 27 pockets: 12 red, 12 black, 3 green, so Hard comes up about
11% of the time. Any length works; the wheel geometry is generated from it.

```ts
export const WHEEL_POCKETS: string[] = Array.from({ length: 27 }, (_, i) => {
  if (i % 9 === 0) return 'hard';
  return i % 2 === 0 ? 'easy' : 'normal';
});
```

### Changing the dice

`LOADOUT_COST_FACES` and `ATTACHMENT_COST_FACES` in `deltaforce.ts` are six
entries each, indexed by pips — index 0 is a roll of 1. Edit the names and
notes freely; the 3D dice don't care what the faces mean.

Like the wheel, the throw is choreographed: the app picks both values first,
then tumbles the dice onto exactly those faces. `verify-dice.mjs` proves that
mapping holds for all six values under any yaw, since a die that lands showing
a different number than the app reported would be a silent, ugly bug.

### Reordering the reels

Reorder `SLOTS` in `slots.ts`. Declaration order **is** the stop order — the
reels all start together and settle top-to-bottom of that array.

### Adding a reel

Append to `SLOTS`. The reel, its settings controls, its persistence, and its
place in the stop sequence all follow automatically:

```ts
{ id: 'grenade', label: 'Grenade', entries: GRENADES,
  filters: [{ kind: 'multi', attr: 'type', label: 'Grenade types', values: [...] }] }
```

### Gating one reel on another

`dependsOn` filters a slot's pool by another slot's result. The parent must sit
earlier in `SLOTS`, since pools resolve in declaration order. This is how
difficulty controls the map:

```ts
dependsOn: {
  slotId: 'mode',
  match: (entry, parent) => String(entry.attrs?.modes ?? '').split(',').includes(parent.id),
}
```

Difficulty is not itself a reel — the wheel produces it, and `App.tsx` injects
the result into the rolls record under the id `mode` so the gate can read it
like any other parent.

### Updating game data

Plain arrays in `deltaforce.ts`. A weapon is `w('id', 'Name', 'Assault Rifle')`,
a gear item is `g('id', 'Name', 5)` where the number is the tier. Any entry
accepts `weight` (default `1`); `weight: 0` excludes it without deleting it.

---

## How the wheel works

The spin is **choreographed, not simulated**. The app picks the winning pocket
first (seeded), then animates the ball so it lands there. Real physics would be
prettier and non-deterministic, which is the wrong trade for a tool with
shareable links.

The maths leans on one identity: a point at local angle `t` sits at
`(r·cos t, y, -r·sin t)`, so rotating the wheel group by `phi` about Y puts it
at `(r·cos(t+phi), y, -r·sin(t+phi))` — a pocket's world angle is just
`localAngle + phi`. The ball's total travel is then solved backwards from where
the wheel will be when it stops.

Ball and wheel counter-rotate, the ball spirals down the apron over the last
45% of the spin, and hops as it crosses the deflectors. The deflectors are
cosmetic; they never change the outcome.

---

## Seeding

Every slot draws from its own RNG stream keyed on `seed|slotId|spinCount`, and
the wheel uses `seed|wheel|spinCount`. Re-spinning one reel never disturbs the
others, and a given triple always yields the same result. The seed button
copies a link that reproduces the run.

A share link reproduces the *rolls*, not your filter settings. To include those,
encode `FilterState` into the query string in `App.tsx` — it is a flat,
JSON-safe object for exactly that reason.

---

## How difficulty restricts your kit

This surprised me when I researched it, and it runs the opposite way to how
most people assume:

- **Easy caps you.** The client refuses to deploy with a **helmet or ballistic
  vest above Tier 4** (it also caps ammo at Tier 3, which this tool doesn't
  model). Chest rigs and backpacks are *not* named in that restriction and
  appear uncapped, so they're left unfiltered rather than guessed at.
- **Normal and Hard cap nothing.** Their gate runs the other way — a *minimum*
  total kit value you must be carrying to queue, from 112,500 alloy on Zero Dam
  Normal up to ~780,000 on Tide Prison. It's a floor, not a fee: nothing is
  deducted. The tool has no per-item prices so it can't enforce this; the
  figures live in `ACCESS_VALUE` for reference.
- **No weapon or operator restrictions** exist at any difficulty.
- **Tide Prison is Hard-only.** It has no Easy or Normal variant.
- **Zero Dam Night is not a Hard tier.** Dusk carries the Easy restrictions;
  Long Night and Ever Night behave like Normal.

Caps live in `MODE_GEAR_CAPS` and are applied through the same `dependsOn`
mechanism the map reel uses, so adding a cap for another slot is one line.

Anything before roughly March 2025 will tell you Easy is completely
uncapped — that's stale; the caps arrived a season later on global than on CN.

## Data accuracy

Researched against official Garena patch notes and community wikis, current to
**Season 10 "Meltdown" (August 2026)**. Soft spots, all marked `TODO:` in
`deltaforce.ts`:

- The game may split G3 / M7 / SCAR-H / ASh-12 / RM277 into a **Battle Rifle**
  category; they are filed under Assault Rifle.
- Chest rigs genuinely cap at **Tier 5** — real, not missing data.
- Map difficulty lists say which tiers *exist*, not what is playable right now.
  Operations runs a rotation.
- Hard-tier access values come from community calculators, not an official
  English source. Treat them as ±2%.
- Whether AZ3 Easy carries the same Tier 4 cap is unconfirmed — plausible by
  analogy with the other Easy maps, but not directly attested.
- Chest rig and backpack being uncapped on Easy is an argument from silence:
  the in-game error names only helmet, vest and ammo.

---

## Testing

```bash
npm test              # dice maths + full browser walkthrough
npm run verify:dice   # dice maths only, no browser needed
npm run smoke         # browser walkthrough only
```

`verify-dice.mjs` checks the die model in isolation: material slots agree with
face normals, opposite faces sum to 7, and every value lands face-up under any
yaw.

`smoke.mjs` builds, serves `dist/`, and drives a headless Chromium through the
whole loop — wheel spin → difficulty → token → drag-to-insert → lever →
sequential reel stops → dice throw. 34 assertions covering: the map respects
the rolled difficulty, the token is minted in the right metal, Hold survives a
pull, reels stop staggered rather than together, the pips agree with the caps
shown, seeded spins and throws reproduce, and the console stays clean.

It also guards one specific regression: **the lever's label must sit inside the
button's hit box.** It was previously positioned just below it, so clicking the
one thing that said "PULL" hit nothing — the lever looked broken while working
perfectly everywhere else. Both input paths are covered: drag-past-commit and
plain click.

### Sound

Everything is synthesized in WebAudio at runtime — no audio files ship, so
nothing 404s on a static host. `src/engine/sound.ts` builds it from three
primitives: oscillator tones, pitch sweeps, and band-passed noise bursts for
knocks and clatter, plus a `NoiseLoop` for sustained beds whose pitch and
volume can be moved while playing.

The two continuous beds track their animations rather than looping at a fixed
pitch: the ball's rolling bed follows its deceleration curve, and the reel
whirr winds down over the length of the longest reel. Impact sounds are driven
by the 3D scenes themselves — the wheel and dice tray fire `onRattle` /
`onBounce` at each real contact in the bounce envelope, with strength decaying
per hop, so the audio lands exactly on the visible bounces instead of being
guessed at with timers.

Toggle it all off under Settings → Enable sounds.

### Framing the wheel

`RouletteWheel` sizes its camera from the geometry rather than a tuned magic
number, so the bowl is never cropped at any aspect ratio. Fitting a bounding
*sphere* is the usual trick, but it wastes a lot of frame here — the bowl is a
flat disc, so at a 24° tilt it needs much less vertical room than horizontal.
Each axis is measured against its own field of view instead.

WebGL runs under SwiftShader, so it all works headless with no GPU.

---

## Licence and attribution

Original work — code, styling, 3D scene, and structure written from scratch.
Item and operator names are factual game data.

Unofficial fan tool. Delta Force is a trademark of its publisher; this project
is not affiliated with, endorsed by, or sponsored by them.
