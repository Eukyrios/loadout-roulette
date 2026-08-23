import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Coin } from './components/Coin';
import { DependencyChip, type DependencyOption } from './components/DependencyChip';
import { ControlBar } from './components/ControlBar';
import { RangeControl, SettingsPanel } from './components/SettingsPanel';
import { SlotMachine } from './components/SlotMachine';
import {
  ATTACHMENT_COST_FACES,
  LOADOUT_COST_FACES,
  MAX_KEYS,
  MAPS,
  MODES,
  MODE_BY_ID,
  WEAPONS,
  WEAPON_BY_ID,
  SQUAD_BY_ID,
  STICK_BUNDLE,
  WHEEL_POCKETS,
  keycardTier,
  keycardsFor,
} from './data/deltaforce';
import { ATTACH_BY_CAT, ATTACH_SLOTS, type Attachment } from './data/attachments';
import {
  AMMO_BY_CALIBER,
  AMMO_WITH_ART,
  WEAPON_CALIBER,
  type Ammo,
  ammoImageSrc,
} from './data/ammo';
import { CHANGELOG } from './data/changelog';
import { TIER_NAME, ammoTier, tierHex } from './data/rarity';
import { SLOTS } from './data/slots';
import type { Entry, FilterState, Roll } from './data/types';
import { defaultFilterState, rangeBounds, rangeKey, resolvePools } from './engine/filters';
import { usePersisted } from './engine/persist';
import { animMs } from './engine/settings';
import { PRESETS, applyPreset } from './engine/presets';
import { hashString, mulberry32, randomSeedCode } from './engine/rng';
import {
  emptySlots,
  rollAll,
  rollDie,
  rollCapsule,
  rollDart,
  rollKeycard,
  rollPocket,
  rollSlot,
  rollStick,
} from './engine/roll';
import { sfx } from './engine/sound';
import { RouletteWheel, type RouletteHandle } from './three/RouletteWheel';
import { DiceTray, type DiceHandle } from './three/DiceTray';
import { StickCup, type StickHandle } from './three/StickCup';
import { CardFan, type CardFanHandle } from './three/CardFan';
import { CapsuleMachine, type CapsuleHandle } from './three/CapsuleMachine';
import { AmmoWheel, type AmmoWheelHandle } from './three/AmmoWheel';

/**
 * Is the ammunition wheel finished enough to show?
 *
 * Yes, with one thing deliberately left out: it does not check whether the
 * round fits the gun. Set this to false to board the stage up again behind an
 * under-construction notice — nothing else has to change.
 */
const DART_READY = true;

/** How many rounds go on the wheel. Six wedges is the most that stays legible. */
const DART_WEDGES = 6;

/**
 * Deal a wheel: six rounds from the whole catalogue, hardest first.
 *
 * Fit is ignored on purpose for now — the wheel is a lucky dip, not a
 * gunsmith. The caliber data is all still there (WEAPON_CALIBER and
 * ammoForWeapon in data/ammo.ts) for when that comes back. Only rounds with a
 * mirrored picture are eligible, because a wheel is mostly pictures.
 *
 * Seeded off the spin count, so a shared link deals the same wheel.
 */
function dealWheel(seed: string, spin: number, caliber: string | null): Ammo[] {
  const rng = mulberry32(hashString(`${seed}:ammowheel:${caliber ?? 'any'}:${spin}`));
  // With a caliber in force the wheel is that caliber's own ladder — spin it
  // and you are choosing which grade of the round you are already committed
  // to. Without one it is a lucky dip across everything.
  const inCal = caliber ? (AMMO_BY_CALIBER[caliber] ?? []).filter((a) => a.hasArt) : [];
  if (inCal.length > 0) return inCal.slice(0, DART_WEDGES);
  const pool = [...AMMO_WITH_ART];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DART_WEDGES).sort((a, b) => (b.pen ?? -1) - (a.pen ?? -1));
}

/**
 * Base spin length for one reel. Reels run STRICTLY ONE AT A TIME, left to
 * right, so these add up — hence a shorter base than when they overlapped.
 */
const SPIN_BASE = 700;

/**
 * How much longer a Tier 6 spins than a Tier 1.
 *
 * Rarity multiplies the spin rather than adding to it, so the ratio is exact
 * and identical for every column. An earlier version added a flat bonus on top
 * of a per-column stagger, which diluted it — a red came out 2.07x a grey in
 * the first column but only 1.59x by the fourth.
 *
 * Running the reels in sequence rather than in parallel is what lets rarity
 * stretch a spin freely: order is guaranteed by the queue, not by the clock, so
 * a long spin can never overtake the column before it.
 */
const RARITY_MAX = 2.5;

/** 1.0 at Tier 1, rising evenly to RARITY_MAX at Tier 6. */
const rarityFactor = (tier: number) =>
  1 + (Math.max(1, Math.min(6, tier)) - 1) * ((RARITY_MAX - 1) / 5);

/** How long a reel should spin for the item it is about to land on. */
const spinTimeFor = (entry: Entry | null) =>
  Math.round(animMs(SPIN_BASE * rarityFactor(Number(entry?.attrs?.tier ?? 1))));

function seedFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const s = new URLSearchParams(window.location.search).get('seed');
  return s && /^[A-Z0-9]{4,16}$/i.test(s) ? s.toUpperCase() : null;
}

/**
 * Every section heading in the app is this shape: a small "Delta Force"
 * eyebrow above the title itself.
 */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="secttl">
      <span className="secttl__eyebrow">Delta Force</span>
      <h2 className="secttl__title">{children}</h2>
    </div>
  );
}

export default function App() {
  const [filters, setFilters] = usePersisted<FilterState>('filters', defaultFilterState());

  // Fixed for the life of the page: ?seed=CODE still pins a reproducible run.
  const [seed] = useState(() => seedFromUrl() ?? randomSeedCode());
  const [spins, setSpins] = useState<Record<string, number>>({});
  const [rolls, setRolls] = useState<Record<string, Roll>>({});
  const [spinning, setSpinning] = useState<Record<string, boolean>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});

  // --- the two-stage game state -------------------------------------------
  const [mode, setMode] = useState<Entry | null>(null);
  const [wheelBusy, setWheelBusy] = useState(false);
  const [coinReady, setCoinReady] = useState(false);
  const [credits, setCredits] = useState(0);
  /** Difficulty stamped on the token currently inside the machine. */
  const [creditMode, setCreditMode] = useState<Entry | null>(null);

  // --- dice ----------------------------------------------------------------
  const [loadoutCost, setLoadoutCost] = useState<Entry | null>(null);
  const [attachCost, setAttachCost] = useState<Entry | null>(null);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [diceBusy, setDiceBusy] = useState(false);

  // --- keycards, drawn blind from the fan ----------------------------------
  // Indices into the rolled map's deck, in the order they came out.
  const [keys, setKeys] = useState<number[]>([]);
  const [keyBusy, setKeyBusy] = useState(false);

  // --- attachments, dispensed by the capsule machine ------------------------
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [capsuleBusy, setCapsuleBusy] = useState(false);

  // --- ammunition, picked by spinning the wheel ----------------------------
  const [ammo, setAmmo] = useState<Ammo | null>(null);
  const [dartBusy, setDartBusy] = useState(false);
  const [rounds, setRounds] = useState<Ammo[]>(() => dealWheel(seed, 0, null));

  // --- squad size, drawn from the stick cup --------------------------------
  const [squad, setSquad] = useState<Entry | null>(null);
  const [stickBusy, setStickBusy] = useState(false);

  /**
   * Hand-set dependencies.
   *
   * Each stage that needs an earlier result reads its override first and the
   * rolled value second, so the stages do not have to be played in order. Null
   * means "use whatever was rolled".
   */
  const [pickedMap, setPickedMap] = useState<string | null>(null);
  const [pickedWeapon, setPickedWeapon] = useState<string | null>(null);
  const [pickedCaliber, setPickedCaliber] = useState<string | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const diceRef = useRef<DiceHandle>(null);
  const stickRef = useRef<StickHandle>(null);
  const cardRef = useRef<CardFanHandle>(null);
  const capsuleRef = useRef<CapsuleHandle>(null);
  const dartRef = useRef<AmmoWheelHandle>(null);
  const wheelRef = useRef<RouletteHandle>(null);
  const coinSlotRef = useRef<HTMLDivElement>(null);
  /** Columns still waiting to spin, in order. Drained by onSpinEnd. */
  const spinQueue = useRef<string[]>([]);
  /** Results held back until each column's own spin begins. */
  const pendingRolls = useRef<Record<string, Roll>>({});
  /** True while a lever pull is running, so only that earns the jackpot. */
  const fullPull = useRef(false);

  /* ----------------------------------------------------------- derived */

  // The roulette result rides in the same record as the reels so the map
  // slot's dependsOn gate can read it like any other parent.
  const rollsWithMode = useMemo<Record<string, Roll>>(
    () => ({ ...rolls, mode: { slotId: 'mode', entry: mode, held: false } }),
    [rolls, mode],
  );

  const pools = useMemo(() => resolvePools(filters, rollsWithMode), [filters, rollsWithMode]);
  const missing = useMemo(
    () => (mode ? emptySlots(filters, rollsWithMode) : []),
    [filters, rollsWithMode, mode],
  );
  const anySpinning = Object.values(spinning).some(Boolean);

  /**
   * Which preset the current filters correspond to, DERIVED rather than
   * remembered. Storing the last preset clicked would go stale the moment a
   * single tier bound was nudged afterwards — the badge would keep claiming
   * "Full send" over filters that no longer matched it. Comparing the actual
   * state means it drops to "Custom" the instant it stops being true, and it
   * survives a reload from storage.
   */
  const activePreset = useMemo(() => {
    // Key order is not guaranteed across storage round-trips, so canonicalise.
    const canon = (f: FilterState) =>
      JSON.stringify({
        ranges: Object.entries(f.ranges).sort(([a], [b]) => (a < b ? -1 : 1)),
        multi: Object.entries(f.multi)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([k, v]) => [k, [...v].sort()]),
      });
    const now = canon(filters);
    return PRESETS.find((p) => canon(applyPreset(p.id)) === now)?.name ?? 'Custom';
  }, [filters]);
  // Two ways to spend a token: the lever re-rolls every column, or a single
  // column's Spin button re-rolls just that one. Hold and the nudge arrows are
  // free — they only rearrange what you already have.

  /* -------------------------------------------------------- the wheel */

  const spinWheel = useCallback(async () => {
    if (wheelBusy) return;
    setWheelBusy(true);
    setCoinReady(false);

    const n = (spins.__wheel ?? 0) + 1;
    setSpins((p) => ({ ...p, __wheel: n }));
    const pocket = rollPocket(seed, n);

    // Track the ball's speed with the rolling bed so the audio decelerates
    // with the picture instead of running at one pitch throughout.
    sfx.wheelStart();
    const t0 = performance.now();
    const ticker = window.setInterval(() => {
      const u = Math.min(1, (performance.now() - t0) / 6200);
      sfx.wheelSpeed(Math.pow(1 - u, 1.5));
    }, 140);

    await wheelRef.current?.spin(pocket);
    window.clearInterval(ticker);
    sfx.wheelStop();

    const won = MODE_BY_ID[WHEEL_POCKETS[pocket]] ?? MODES[0];
    setMode(won);
    // Difficulty only governs the map, so only the map reel is cleared. Wiping
    // the whole board here would make Hold pointless: every pull needs a coin,
    // every coin needs a wheel spin, so anything held would never survive.
    setRolls((prev) => ({ ...prev, map: { slotId: 'map', entry: null, held: false } }));
    setCoinReady(true);
    setWheelBusy(false);
    sfx.coinDrop();
  }, [seed, spins, wheelBusy]);

  const insertCoin = useCallback(() => {
    setCoinReady(false);
    setCredits((c) => c + 1);
    // The token carries its difficulty into the machine — that is what the
    // cabinet's indicator reports, rather than a credit count.
    setCreditMode(mode);
    sfx.coin();
  }, [mode]);

  /**
   * Skip the wheel: pick a difficulty straight off the legend and mint the
   * matching token. Same downstream effect as winning that colour.
   */
  const chooseMode = useCallback(
    (picked: Entry) => {
      if (wheelBusy) return;
      setMode(picked);
      setRolls((prev) => ({ ...prev, map: { slotId: 'map', entry: null, held: false } }));
      setCoinReady(true);
      sfx.coinDrop();
    },
    [wheelBusy],
  );

  /* --------------------------------------------------------- the reels */

  /**
   * Hand a roll's results down to the stages that depend on them.
   *
   * The chips read their override first, so a value set by hand would sit in
   * front of a freshly rolled one and the later stages would quietly still be
   * working from the old choice. Rolling clears the overrides it supersedes,
   * which is what makes "pull once and everything downstream is set" true —
   * and nothing stops you setting any of them again straight afterwards.
   */
  const adoptRolled = useCallback((slotId?: string) => {
    if (!slotId || slotId === 'weapon') {
      setPickedWeapon(null);
      // The wheel's caliber comes from the gun unless it was named directly.
      setPickedCaliber(null);
    }
    if (!slotId || slotId === 'map') setPickedMap(null);
  }, []);

  const pull = useCallback(() => {
    // A token UNLOCKS the machine, it does not buy one go. Charging per pull
    // meant every re-roll sent you back to the wheel for another coin, and the
    // per-column Spin buttons greyed out the instant you used one of them.
    if (credits === 0 || anySpinning) return;
    adoptRolled();

    const nextSpins = { ...spins };
    for (const slot of SLOTS) {
      if (rolls[slot.id]?.held) continue;
      nextSpins[slot.id] = (nextSpins[slot.id] ?? 0) + 1;
    }
    setSpins(nextSpins);
    // Rolled up front so each reel's spin time can be set from the item it is
    // actually going to land on.
    const nextRolls = rollAll(seed, nextSpins, filters, rollsWithMode);

    // One reel at a time, left to right: each starts only when the one before
    // it has landed. The queue — not a set of staggered timers — is what
    // guarantees the order, which is why a rare reel can spin as long as it
    // likes without ever overtaking its neighbour.
    const live = SLOTS.filter((s) => !rolls[s.id]?.held && pools[s.id].length > 0);
    const times = Object.fromEntries(
      live.map((s) => [s.id, spinTimeFor(nextRolls[s.id]?.entry ?? null)]),
    );
    setDurations(times);

    fullPull.current = true;
    if (live.length === 0) return;

    // A queued reel must NOT be told its result yet. Publishing every result at
    // pull time meant the six columns still waiting had nothing left to hide:
    // each snapped straight to its final item and then rolled around to the
    // answer it was already showing. So the results are staged here, and each
    // reel is handed its own only as its spin starts.
    pendingRolls.current = Object.fromEntries(live.map((s) => [s.id, nextRolls[s.id]]));
    spinQueue.current = live.slice(1).map((s) => s.id);

    const first = live[0].id;
    const held = new Set(live.map((s) => s.id));
    setRolls(() => {
      const out: Record<string, Roll> = { ...nextRolls };
      // Everything not about to spin can update immediately; the queued ones
      // keep showing what they had until their turn.
      for (const id of held) out[id] = rolls[id] ?? { slotId: id, entry: null, held: false };
      out[first] = nextRolls[first];
      return out;
    });
    setSpinning({ [first]: true });

    sfx.lever();
    sfx.reelStart();
    // The reels run back to back, so the whirr has to cover the SUM of them.
    const span = Math.max(SPIN_BASE, Object.values(times).reduce((a, b) => a + b, 0));
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const u = (performance.now() - t0) / span;
      if (u >= 1) return window.clearInterval(id);
      sfx.reelSpeed(1 - u * 0.75);
    }, 150);
  }, [adoptRolled, anySpinning, credits, filters, pools, rolls, rollsWithMode, seed, spins]);

  const spinOne = useCallback(
    (slotId: string) => {
      // Free once the machine is loaded, exactly like the lever.
      if (credits === 0 || anySpinning || pools[slotId]?.length === 0) return;
      adoptRolled(slotId);
      const nextSpin = (spins[slotId] ?? 0) + 1;
      const entry = rollSlot(slotId, seed, nextSpin, filters, rollsWithMode, rolls[slotId]?.entry);
      setSpins((p) => ({ ...p, [slotId]: nextSpin }));
      setRolls((p) => ({ ...p, [slotId]: { slotId, entry, held: false } }));
      setDurations((d) => ({ ...d, [slotId]: spinTimeFor(entry) }));
      spinQueue.current = [];
      fullPull.current = false;
      setSpinning((p) => ({ ...p, [slotId]: true }));
    },
    [adoptRolled, anySpinning, credits, filters, pools, rolls, rollsWithMode, seed, spins],
  );

  const nudge = useCallback(
    (slotId: string, dir: -1 | 1) => {
      const pool = pools[slotId] ?? [];
      if (!pool.length) return;
      const cur = rolls[slotId]?.entry;
      const idx = cur ? pool.findIndex((e) => e.id === cur.id) : -1;
      const next = pool[(idx + dir + pool.length) % pool.length];
      setRolls((p) => ({
        ...p,
        [slotId]: { slotId, entry: next, held: p[slotId]?.held ?? false },
      }));
      sfx.tick();
    },
    [pools, rolls],
  );

  const toggleHold = useCallback((slotId: string) => {
    setRolls((prev) => {
      const cur = prev[slotId];
      if (!cur) return prev;
      return { ...prev, [slotId]: { ...cur, held: !cur.held } };
    });
    sfx.hold();
  }, []);

  const onTick = useCallback(() => {
    sfx.tick();
  }, []);

  const onSpinEnd = useCallback((slotId: string) => {
    setSpinning((prev) => (prev[slotId] ? { ...prev, [slotId]: false } : prev));
    sfx.reelLand(Math.max(0, SLOTS.findIndex((s) => s.id === slotId)));

    // Hand off to the next column, or finish the run.
    const next = spinQueue.current.shift();
    if (next) {
      // Result and spin start land in the same batch, so the reel never gets a
      // render where it knows its answer but is not yet moving.
      const staged = pendingRolls.current[next];
      if (staged) setRolls((p) => ({ ...p, [next]: staged }));
      setSpinning({ [next]: true });
      return;
    }
    sfx.reelStop();
    // Only a full pull earns the fanfare — a single-column spin does not.
    if (fullPull.current) {
      fullPull.current = false;
      window.setTimeout(() => sfx.jackpot(), 130);
    }
  }, []);

  /* ------------------------------------------------------------ effects */

  // Replace picks the filters no longer allow. Only fills a blank reel once
  // the machine has been paid for, so an unpaid board stays empty.
  useEffect(() => {
    setRolls((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const slot of SLOTS) {
        const cur = prev[slot.id]?.entry;
        const pool = pools[slot.id];
        // Replace a pick the filters now forbid. Never fill a blank: a blank
        // reel is the machine waiting for the lever, not a gap to paper over.
        const stale = cur ? !pool.some((e) => e.id === cur.id) : false;
        if (!stale) continue;
        next[slot.id] = {
          slotId: slot.id,
          entry: rollSlot(
            slot.id,
            seed,
            (spins[slot.id] ?? 0) + 1000,
            filters,
            { ...rollsWithMode, ...next },
          ),
          held: false,
        };
        changed = true;
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools]);

  const rollDice = useCallback(async () => {
    if (diceBusy) return;
    setDiceBusy(true);
    const n = (spins.__dice ?? 0) + 1;
    setSpins((p) => ({ ...p, __dice: n }));

    const a = rollDie(seed, 'loadout', n);
    const b = rollDie(seed, 'attach', n);

    sfx.diceThrow();
    // Bounce and settle sounds are fired by the tray itself, on real contacts.
    await diceRef.current?.roll(a, b);

    setDice([a, b]);
    setLoadoutCost(LOADOUT_COST_FACES[a - 1]);
    setAttachCost(ATTACHMENT_COST_FACES[b - 1]);
    setDiceBusy(false);
  }, [diceBusy, seed, spins]);

  /* --- keycards ---------------------------------------------------------- */

  // The deck is whatever the ROLLED map's locked rooms are, so there is nothing
  // to draw from until stage two has landed a map.
  const rolledMap = rolls.map?.entry?.id ?? null;
  const mapId = pickedMap ?? rolledMap;
  const deck = useMemo(() => keycardsFor(mapId), [mapId]);
  const drawnKeys = useMemo(() => keys.map((i) => deck[i]).filter(Boolean), [deck, keys]);
  // Five is the ceiling, but a map documented as running generic tiered access
  // cards has a deck of three — you cannot draw more keys than exist.
  const keyLimit = Math.min(MAX_KEYS, deck.length);

  // A new map is a new set of doors, so the hand it was drawn against is void.
  useEffect(() => {
    setKeys([]);
    cardRef.current?.reset();
  }, [mapId]);

  const drawKey = useCallback(async () => {
    if (keyBusy || keys.length >= keyLimit) return;
    setKeyBusy(true);
    const n = (spins.__keys ?? 0) + 1;
    setSpins((p) => ({ ...p, __keys: n }));

    const index = rollKeycard(seed, n, deck.length, keys);
    if (index < 0) {
      setKeyBusy(false);
      return;
    }
    // Slide and flip sounds come from the fan itself, on the beat the card
    // actually moves, rather than being guessed at with timers out here.
    // The fan cannot know the hand is full — the deck is three cards on the
    // maps that run generic access cards — so the last draw is flagged here.
    await cardRef.current?.draw(keys.length, deck[index], keys.length + 1 >= keyLimit);

    setKeys((p) => [...p, index]);
    setKeyBusy(false);
  }, [deck, keyBusy, keyLimit, keys, seed, spins]);

  const clearKeys = useCallback(() => {
    if (keyBusy) return;
    sfx.cardShuffle();
    cardRef.current?.reset();
    setKeys([]);
  }, [keyBusy]);

  /* --- the capsule machine ------------------------------------------------ */

  const rolledWeapon = rolls.weapon?.entry ?? null;
  const weapon = (pickedWeapon ? WEAPON_BY_ID[pickedWeapon] : null) ?? rolledWeapon;
  /** Five slots' worth. Fit is deliberately ignored — see CapsuleMachine. */
  const CAPSULE_SIZE = 5;

  // A new gun means the old capsule's contents are no longer "what you got".
  useEffect(() => {
    setAttachments([]);
    capsuleRef.current?.reset();
  }, [weapon?.id]);

  const turnCrank = useCallback(async () => {
    if (capsuleBusy || !weapon) return;
    setCapsuleBusy(true);
    const n = (spins.__capsule ?? 0) + 1;
    setSpins((p) => ({ ...p, __capsule: n }));

    const picks = rollCapsule(seed, n, CAPSULE_SIZE)
      .map(([slot, idx]) => (ATTACH_BY_CAT[ATTACH_SLOTS[slot]] ?? [])[idx])
      .filter(Boolean);

    // Crank, bounce and pop all come from the machine itself, on the beat the
    // capsule actually moves, rather than being guessed at with timers here.
    await capsuleRef.current?.dispense(picks);

    setAttachments(picks);
    setCapsuleBusy(false);
  }, [capsuleBusy, seed, spins, weapon]);

  /* --- what each stage is working from ------------------------------------- */

  const mapOptions = useMemo<DependencyOption[]>(
    () => MAPS.map((m) => ({ id: m.id, name: m.name, note: m.note })),
    [],
  );
  const weaponOptions = useMemo<DependencyOption[]>(
    () => WEAPONS.map((w) => ({ id: w.id, name: w.name, note: String(w.attrs?.class ?? '') })),
    [],
  );
  const presetOptions = useMemo<DependencyOption[]>(
    () => PRESETS.map((p) => ({ id: p.id, name: p.name, note: p.blurb })),
    [],
  );

  /**
   * The tier bounds for one column, or nothing if it has none.
   *
   * Built here rather than inside the machine because the filter state lives
   * here; the machine just puts it under the right reel.
   */
  const rangeFor = useCallback(
    (slotId: string) => {
      const slot = SLOTS.find((x) => x.id === slotId);
      const f = slot?.filters?.find((x) => x.kind === 'range');
      // An empty box, not nothing: the columns with no tier filter still need
      // the same strip of height or their headings sit higher than the rest.
      if (!slot || !f || f.kind !== 'range') return <div className="reel__range" />;
      const key = rangeKey(slot.id, f.attr);
      const bounds = rangeBounds(slot, f.attr, [f.min, f.max]);
      return (
        <div className="reel__range">
          <RangeControl
            slot={slot}
            label={f.label}
            format={f.format ?? String}
            // The bounds are named after colours now, so each end is printed
            // in the colour it names. Only the rarity ranges get this; any
            // other range keeps the accent.
            colorFor={f.attr === 'tier' ? (v) => tierHex(v) : undefined}
            bounds={bounds}
            value={filters.ranges[key] ?? bounds}
            onChange={(next) =>
              setFilters({ ...filters, ranges: { ...filters.ranges, [key]: next } })
            }
          />
        </div>
      );
    },
    [filters, setFilters],
  );

  const modeOptions = useMemo<DependencyOption[]>(
    () => MODES.map((m) => ({ id: m.id, name: m.name, note: m.note })),
    [],
  );
  const caliberOptions = useMemo<DependencyOption[]>(
    () =>
      Object.keys(AMMO_BY_CALIBER)
        .sort()
        .map((c) => ({
          id: c,
          name: c,
          note: `${AMMO_BY_CALIBER[c].length} rounds`,
        })),
    [],
  );

  /**
   * The caliber the wheel is loaded with.
   *
   * Hand-set first, then whatever the rolled gun chambers. Null means no
   * caliber is in force and the wheel deals from the whole catalogue.
   */
  const caliber = pickedCaliber ?? (weapon ? (WEAPON_CALIBER[weapon.id] ?? null) : null);

  /* --- the ammunition wheel ------------------------------------------------ */

  const spinAmmo = useCallback(async () => {
    if (dartBusy) return;
    setDartBusy(true);
    const n = (spins.__dart ?? 0) + 1;

    // A fresh wheel is dealt as the spin STARTS, not when the last one
    // finished. Redealing on landing wiped the winner off the wheel the
    // instant it was decided, which made the result look like it had not
    // happened.
    const next = dealWheel(seed, n, caliber);
    setRounds(next);
    dartRef.current?.setRounds(next);

    const idx = rollDart(seed, n, next.length);
    await dartRef.current?.spinTo(next, idx);

    setAmmo(next[idx] ?? null);
    setSpins((p) => ({ ...p, __dart: n }));
    setDartBusy(false);
  }, [dartBusy, seed, spins, caliber]);

  /**
   * Redeal whenever the caliber in force changes — including on first paint.
   *
   * Nothing else redeals: a spin deals its own wheel as it starts, because
   * dealing on landing wiped the winner off the instant it was decided.
   */
  useEffect(() => {
    const next = dealWheel(seed, spins.__dart ?? 0, caliber);
    setRounds(next);
    dartRef.current?.setRounds(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caliber, seed]);

  const drawStick = useCallback(async () => {
    if (stickBusy) return;
    setStickBusy(true);
    const n = (spins.__sticks ?? 0) + 1;
    setSpins((p) => ({ ...p, __sticks: n }));

    const index = rollStick(seed, n);
    // Rattle and draw sounds are fired by the cup itself, in step with the
    // shake, rather than guessed at with timers out here.
    await stickRef.current?.draw(index);

    setSquad(SQUAD_BY_ID[STICK_BUNDLE[index]] ?? null);
    setStickBusy(false);
  }, [seed, spins, stickBusy]);

  // Spacebar: spin the wheel if there's nothing to pull, otherwise pull.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(el.tagName)) return;
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (credits > 0) pull();
      else if (!coinReady) void spinWheel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [coinReady, credits, pull, spinWheel]);

  /* ------------------------------------------------------------- render */

  return (
    <div className="app">
      <header className="hdr">
        <div>
          <div className="secttl">
            <span className="secttl__eyebrow">Delta Force</span>
            <h1 className="secttl__title secttl__title--lg">
              Loadout <span>Roulette</span>
            </h1>
          </div>
          <p className="hdr__sub">Operations · spin, take the token, pull</p>
        </div>
      </header>

      {/* ---------------------------------------------------- stage one */}
      <section className="stage">
        <div className="stage__wheel">
          <RouletteWheel
            ref={wheelRef}
            className="wheelcanvas"
            onRattle={(s) => sfx.ballRattle(s)}
          />
          <div className="wheelglow" aria-hidden="true" />
        </div>

        <div className="stage__side">
          <SectionTitle>1 · Roll for difficulty</SectionTitle>
          {/* Also a manual override: click a colour to mint that token
              directly and skip the wheel. */}
          <ul className="legend">
            {MODES.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`legend__item legend__item--${m.attrs?.color}${
                    mode?.id === m.id ? ' is-won' : ''
                  }`}
                  onClick={() => chooseMode(m)}
                  disabled={wheelBusy}
                  aria-pressed={mode?.id === m.id}
                  title={`Take a ${m.name} token without spinning`}
                >
                  <span className="legend__name">{m.name}</span>
                  <span className="legend__note">{m.note}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void spinWheel()}
            disabled={wheelBusy}
          >
            {wheelBusy ? 'Spinning…' : 'Spin the wheel'}
          </button>

          <div className={`dispenser${coinReady ? ' is-open' : ''}`}>
            <div className="dispenser__lip" aria-hidden="true" />
            <div className="dispenser__tray">
              {coinReady ? (
                <Coin
                  targetRef={coinSlotRef}
                  onInsert={insertCoin}
                  tone={String(mode?.attrs?.color ?? 'black')}
                  label={mode?.name.charAt(0).toUpperCase() ?? 'DF'}
                />
              ) : (
                <span className="dispenser__empty">
                  {credits > 0 ? 'Token in machine' : 'Dispenser empty'}
                </span>
              )}
            </div>
            <span className="dispenser__hint">
              {coinReady
                ? 'Drag the token to the coin slot — or click it'
                : credits > 0
                  ? 'Pull the lever to spend it'
                  : 'Spin the wheel to earn a token'}
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- stage two */}
      {/* No heading here: the cabinet's own badge carries the eyebrow and
          title, so a SectionTitle above it would just say it twice. */}
      <section className="stage2">
        {missing.length > 0 && (
          <div className="warn" role="status">
            <strong>Nothing matches your filters</strong> for: {missing.join(', ')}.
          </div>
        )}

        <SlotMachine
          ref={coinSlotRef}
          modeOptions={modeOptions}
          presetOptions={presetOptions}
          onPickPreset={(id: string) => setFilters(applyPreset(id))}
          rangeFor={rangeFor}
          onPickMode={(id: string) => {
            const m = MODE_BY_ID[id];
            if (!m) return;
            setMode(m);
            setCreditMode(m);
            // A hand-set difficulty has to come with a token, or the lever
            // stays locked and the chip looks like it did nothing.
            setCredits((c) => Math.max(1, c));
          }}
          rolls={rolls}
          pools={pools}
          spinning={spinning}
          durations={durations}
          credits={credits}
          creditMode={creditMode}
          preset={activePreset}
          anySpinning={anySpinning}
          onHold={toggleHold}
          onSpin={spinOne}
          onNudge={nudge}
          onSpinEnd={onSpinEnd}
          onTick={onTick}
          onPull={pull}
          settings={
            <SettingsPanel
              open={panelOpen}
              onToggle={() => setPanelOpen((o) => !o)}
              filters={filters}
              onFilters={setFilters}
              onReset={() => setFilters(defaultFilterState())}
            />
          }
        />

      </section>

      {/* -------------------------------------------------- stage three */}
      <section className="stage stage--dice">
        <div className="stage__wheel stage__wheel--dice">
          <DiceTray
            ref={diceRef}
            className="wheelcanvas"
            onBounce={(s) => sfx.diceBounce(s)}
            onSettle={() => sfx.diceSettle()}
          />
          <div className="wheelglow" aria-hidden="true" />
        </div>

        <div className="stage__side">
          <SectionTitle>3 · Roll for spending caps</SectionTitle>

          <div className="dieresult dieresult--white">
            <span className="dieresult__pip">{dice ? dice[0] : '?'}</span>
            <span className="dieresult__body">
              <span className="dieresult__label">Loadout cost</span>
              <span className="dieresult__value">{loadoutCost?.name ?? 'Not rolled'}</span>
              <span className="dieresult__note">{loadoutCost?.note ?? 'White die'}</span>
            </span>
          </div>

          <div className="dieresult dieresult--red">
            <span className="dieresult__pip">{dice ? dice[1] : '?'}</span>
            <span className="dieresult__body">
              <span className="dieresult__label">Attachment cost</span>
              <span className="dieresult__value">{attachCost?.name ?? 'Not rolled'}</span>
              <span className="dieresult__note">{attachCost?.note ?? 'Red die'}</span>
            </span>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void rollDice()}
            disabled={diceBusy}
          >
            {diceBusy ? 'Rolling…' : 'Throw the dice'}
          </button>

        </div>
      </section>

      {/* --------------------------------------------------- stage four */}
      <section className="stage stage--capsule">
        <div className="stage__wheel stage__wheel--capsule">
          <CapsuleMachine
            ref={capsuleRef}
            className="wheelcanvas"
            onCrank={() => sfx.crank()}
            onBounce={(v) => sfx.capsuleBounce(v)}
            onOpen={() => sfx.capsuleOpen()}
          />
          <div className="wheelglow" aria-hidden="true" />

        </div>

        <div className="stage__side">
          <SectionTitle>4 · Crank for attachments</SectionTitle>

          <DependencyChip
            label="Weapon"
            value={weapon?.name ?? null}
            options={weaponOptions}
            onPick={setPickedWeapon}
            onClear={pickedWeapon ? () => setPickedWeapon(null) : undefined}
            source={pickedWeapon ? 'manual' : rolledWeapon ? 'rolled' : null}
            side
          />

          <div className="caps">
            <div className="caps__head">
              <span className="caps__label">In the capsule</span>
              <span className="caps__for">{attachments.length} parts</span>
            </div>

            {attachments.length > 0 ? (
              <ul className="caps__list">
                {attachments.map((a) => (
                  <li key={a.id} className="caps__item">
                    <span className="caps__slot">{a.cat}</span>
                    <span className="caps__name">{a.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="caps__empty">
                {weapon ? 'Nothing dispensed yet' : 'Roll a weapon, or name one above'}
              </p>
            )}
          </div>

          <p className="wip">
            <strong className="wip__tag">Work in progress</strong>
            Attachment compatibility is not working yet — the machine does not check
            what you rolled. Nobody publishes which attachments fit which gun, so for
            now it hands you five slots at random and you may well get an M249
            handguard for your MP5. Everything else on this stage is finished.
          </p>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void turnCrank()}
            disabled={capsuleBusy || !weapon}
            title={weapon ? 'Shake the globe and drop a capsule' : 'Roll a weapon, or name one above'}
          >
            {capsuleBusy ? 'Dispensing…' : 'Turn the crank'}
          </button>
        </div>
      </section>

      {/* --------------------------------------------------- stage five */}
      {DART_READY ? (
        <section className="stage stage--darts">
          <div className="stage__wheel stage__wheel--darts">
            <AmmoWheel
              ref={dartRef}
              className="wheelcanvas"
              onSpin={() => sfx.ammoSpin()}
              onTick={(v) => sfx.ammoTick(v)}
              onLand={() => sfx.ammoLand()}
            />
            <div className="wheelglow" aria-hidden="true" />
          </div>

          <div className="stage__side">
            <SectionTitle>5 · Spin for ammunition</SectionTitle>

            <DependencyChip
              label="Caliber"
              value={caliber}
              options={caliberOptions}
              onPick={setPickedCaliber}
              onClear={pickedCaliber ? () => setPickedCaliber(null) : undefined}
              source={pickedCaliber ? 'manual' : caliber ? 'rolled' : null}
              side
            />

            <div className="dart">
              <div className="dart__head">
                <span className="dart__label">On the wheel</span>
                <span className="dart__for">{rounds.length} rounds</span>
              </div>

              {ammo ? (
                <div className="ammo">
                  {ammoImageSrc(ammo) ? (
                    <img
                      className="ammo__img"
                      src={ammoImageSrc(ammo) ?? undefined}
                      alt=""
                      /* The mirror is the only source. If it has not been made
                         the element hides itself and the drawn cartridge on the
                         board is what you have — better than a broken icon. */
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="ammo__body">
                    <span className="ammo__name">{ammo.name}</span>
                    <span className={`ammo__meta ammo__meta--t${ammoTier(ammo.pen, ammo.id)}`}>
                      <strong>{TIER_NAME[ammoTier(ammo.pen, ammo.id)]}</strong>
                      {ammo.pen === null ? ' · penetration unknown' : ` · penetration ${ammo.pen}`}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="dart__empty">Nothing spun yet</p>
              )}
            </div>

            <p className="stage__hint">
              Six rounds, dealt from every caliber in the game. Spin it and the pawl
              at the top picks one. Spinning again deals a new wheel.
            </p>

            <p className="wip">
              <strong className="wip__tag">Work in progress</strong>
              Caliber matching is not working yet — the wheel does not check whether
              the round fits the gun you rolled, so it is a lucky dip across every
              caliber in the game and a 12 Gauge slug for your MP5 is fair game. Name
              a caliber in the box above and the wheel narrows to that one, which is
              the way round it works until the check is in. The colour on each wedge
              is the round&rsquo;s real tier — the spin is honest, it is the
              shortlist that is not.
            </p>

            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void spinAmmo()}
              disabled={dartBusy || rounds.length === 0}
              title="Spin the wheel"
            >
              {dartBusy ? 'Spinning…' : 'Spin the wheel'}
            </button>
          </div>
        </section>
      ) : (
        <section className="stage stage--darts stage--barred">
          <div className="stage__side">
            <SectionTitle>5 · Spin for ammunition</SectionTitle>
            <p className="wip wip--big">
              <strong className="wip__tag">Under construction</strong>
              The wheel that picks your ammunition is boarded up for now. Nothing else
              on the page is affected.
            </p>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- stage six */}
      <section className="stage stage--cards">
        <div className="stage__wheel stage__wheel--cards">
          <CardFan
            ref={cardRef}
            className="wheelcanvas"
            onSlide={() => sfx.cardSlide()}
            onFlip={() => sfx.cardFlip()}
            onShuffle={() => sfx.cardShuffle()}
          />
          <div className="wheelglow" aria-hidden="true" />
        </div>

        <div className="stage__side">
          <SectionTitle>6 · Draw your keycards</SectionTitle>

          <DependencyChip
            label="Map"
            value={mapId ? (MAPS.find((m) => m.id === mapId)?.name ?? mapId) : null}
            options={mapOptions}
            onPick={setPickedMap}
            onClear={pickedMap ? () => setPickedMap(null) : undefined}
            source={pickedMap ? 'manual' : rolledMap ? 'rolled' : null}
            side
          />

          <div className="keys">
            <div className="keys__head">
              <span className="keys__label">Keycards in hand</span>
              <span className="keys__count">
                {keys.length} / {keyLimit || MAX_KEYS}
              </span>
            </div>

            {drawnKeys.length > 0 ? (
              <ol className="keys__list">
                {drawnKeys.map((name, i) => {
                  const tier = keycardTier(name);
                  return (
                    <li
                      key={`${name}-${i}`}
                      className={`keys__item${tier ? ` keys__item--t${tier}` : ''}`}
                      title={tier ? TIER_NAME[tier] : 'Color not published'}
                    >
                      {name}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="keys__empty">
                {mapId ? 'Nothing drawn yet' : 'Roll a map, or name one above'}
              </p>
            )}
          </div>

          <p className="stage__hint">
            {mapId
              ? 'Face-down, so you take the card before you know the door. Whatever comes out is what you go in for.'
              : 'The deck is the locked rooms on a map. Roll one in stage 2, or name one in the box above.'}
          </p>

          <div className="keys__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void drawKey()}
              disabled={keyBusy || !mapId || keys.length >= keyLimit}
              title={
                !mapId
                  ? 'Roll a map, or name one above'
                  : keys.length >= keyLimit
                    ? 'That is the whole hand'
                    : 'Take a keycard off the fan'
              }
            >
              {keyBusy
                ? 'Drawing…'
                : /* With no map the deck is empty, so keyLimit is 0 and a bare
                     length>=limit test called an untouched hand "full". */
                  mapId && keys.length >= keyLimit
                  ? 'Hand full'
                  : 'Draw a keycard'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={clearKeys}
              disabled={keyBusy || keys.length === 0}
            >
              Put them back
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- stage seven */}
      <section className="stage stage--sticks">
        <div className="stage__wheel stage__wheel--sticks">
          <StickCup
            ref={stickRef}
            className="wheelcanvas"
            onRattle={(s) => sfx.stickRattle(s)}
            onDraw={() => sfx.stickDraw()}
          />
          <div className="wheelglow" aria-hidden="true" />
        </div>

        <div className="stage__side">
          <SectionTitle>7 · Draw for squad size</SectionTitle>

          <div className={`squad squad--${squad?.id ?? 'none'}`}>
            <span className="squad__bands" aria-hidden="true">
              {Array.from({ length: Number(squad?.attrs?.bands ?? 0) }, (_, i) => (
                <span key={i} className="squad__band" />
              ))}
            </span>
            <span className="squad__body">
              <span className="squad__label">Squad</span>
              <span className="squad__value">{squad?.name ?? 'Not drawn'}</span>
              <span className="squad__note">{squad?.note ?? 'Shake the cup and pull a stick'}</span>
            </span>
          </div>

          <p className="stage__hint">
            Twelve sticks, four of each — an even one-in-three. The painted bands
            say the same thing as the colour, so it reads either way.
          </p>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void drawStick()}
            disabled={stickBusy}
          >
            {stickBusy ? 'Shaking…' : 'Shake the cup'}
          </button>
        </div>
      </section>

      {/* --------------------------------------------------- the build log */}


      {/* Same shell as the settings panel: a toggle bar that opens a body.
          It is reference material, so it is shut until asked for. */}
      <section className={`panel${logOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="panel__toggle"
          onClick={() => setLogOpen((o) => !o)}
          aria-expanded={logOpen}
        >
          <span className="panel__toggle-text">
            <span className="secttl__eyebrow">Delta Force</span>
            <span className="panel__toggle-title">Build log</span>
          </span>
          <span className="panel__chevron">{logOpen ? '▴' : '▾'}</span>
        </button>

        {logOpen && (
          <div className="panel__body">
            <ol className="log">
              {CHANGELOG.map((e, i) => (
                <li key={e.title} className={`log__item${i === 0 ? ' log__item--now' : ''}`}>
                  <div className="log__head">
                    <h3 className="log__title">{e.title}</h3>
                    {i === 0 ? <span className="log__badge">Latest</span> : null}
                  </div>
                  <ul className="log__notes">
                    {e.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <ControlBar />

      <footer className="ftr">
        <p>
          An unofficial fan tool. Delta Force is a trademark of its publisher; this project is not
          affiliated with or endorsed by them. Game data is community-sourced and may lag behind the
          live build.
        </p>
      </footer>
    </div>
  );
}
