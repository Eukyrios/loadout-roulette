import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Coin } from './components/Coin';
import { SettingsPanel } from './components/SettingsPanel';
import { SlotMachine } from './components/SlotMachine';
import {
  ATTACHMENT_COST_FACES,
  LOADOUT_COST_FACES,
  MODES,
  MODE_BY_ID,
  WHEEL_POCKETS,
} from './data/deltaforce';
import { SLOTS } from './data/slots';
import type { AppSettings, Entry, FilterState, Roll } from './data/types';
import { defaultFilterState, resolvePools } from './engine/filters';
import { usePersisted } from './engine/persist';
import { applyPreset } from './engine/presets';
import { randomSeedCode } from './engine/rng';
import { emptySlots, rollAll, rollDie, rollPocket, rollSlot } from './engine/roll';
import { sfx } from './engine/sound';
import { RouletteWheel, type RouletteHandle } from './three/RouletteWheel';
import { DiceTray, type DiceHandle } from './three/DiceTray';

/** Reel stop cadence. Reel n settles BASE + n·STEP ms after the pull. */
const SPIN_BASE = 1500;
const SPIN_STEP = 400;

function seedFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const s = new URLSearchParams(window.location.search).get('seed');
  return s && /^[A-Z0-9]{4,16}$/i.test(s) ? s.toUpperCase() : null;
}

export default function App() {
  const [settings, setSettings] = usePersisted<AppSettings>('settings', {
    sounds: true,
    instantSpin: false,
    showNudgers: true,
  });
  const [filters, setFilters] = usePersisted<FilterState>('filters', defaultFilterState());

  const [seed, setSeed] = useState(() => seedFromUrl() ?? randomSeedCode());
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
  /** True once a coin has ever been spent — unlocks the per-reel controls. */
  const [armed, setArmed] = useState(false);

  // --- dice ----------------------------------------------------------------
  const [loadoutCost, setLoadoutCost] = useState<Entry | null>(null);
  const [attachCost, setAttachCost] = useState<Entry | null>(null);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [diceBusy, setDiceBusy] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const diceRef = useRef<DiceHandle>(null);
  const wheelRef = useRef<RouletteHandle>(null);
  const coinSlotRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

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
   * Two different locks. The per-reel controls open once you have EVER paid
   * (`armed`) so you can keep tweaking a result after the pull; the lever needs
   * an unspent credit, so a fresh full roll always costs a token.
   */
  const locked = !armed;

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
    let ticker = 0;
    if (settingsRef.current.sounds) {
      sfx.wheelStart();
      const t0 = performance.now();
      ticker = window.setInterval(() => {
        const u = Math.min(1, (performance.now() - t0) / 6200);
        sfx.wheelSpeed(Math.pow(1 - u, 1.5));
      }, 140);
    }

    await wheelRef.current?.spin(pocket);
    window.clearInterval(ticker);
    if (settingsRef.current.sounds) sfx.wheelStop();

    const won = MODE_BY_ID[WHEEL_POCKETS[pocket]] ?? MODES[0];
    setMode(won);
    // Difficulty only governs the map, so only the map reel is cleared. Wiping
    // the whole board here would make Hold pointless: every pull needs a coin,
    // every coin needs a wheel spin, so anything held would never survive.
    setRolls((prev) => ({ ...prev, map: { slotId: 'map', entry: null, held: false } }));
    setCoinReady(true);
    setWheelBusy(false);
    if (settingsRef.current.sounds) sfx.coinDrop();
  }, [seed, spins, wheelBusy]);

  const insertCoin = useCallback(() => {
    setCoinReady(false);
    setCredits((c) => c + 1);
    // The token carries its difficulty into the machine — that is what the
    // cabinet's indicator reports, rather than a credit count.
    setCreditMode(mode);
    if (settingsRef.current.sounds) sfx.coin();
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
      if (settingsRef.current.sounds) sfx.coinDrop();
    },
    [wheelBusy],
  );

  /* --------------------------------------------------------- the reels */

  const pull = useCallback(() => {
    if (credits === 0 || anySpinning) return;
    setCredits((c) => c - 1);
    setArmed(true);

    const nextSpins = { ...spins };
    for (const slot of SLOTS) {
      if (rolls[slot.id]?.held) continue;
      nextSpins[slot.id] = (nextSpins[slot.id] ?? 0) + 1;
    }
    setSpins(nextSpins);
    setRolls(rollAll(seed, nextSpins, filters, rollsWithMode));

    // Stagger the stop times in SLOTS order — this is what makes them settle
    // one after another rather than all at once.
    const live = SLOTS.filter((s) => !rolls[s.id]?.held && pools[s.id].length > 0);
    setDurations(
      Object.fromEntries(live.map((s, i) => [s.id, SPIN_BASE + i * SPIN_STEP])),
    );
    setSpinning(Object.fromEntries(live.map((s) => [s.id, true])));

    if (settingsRef.current.sounds) {
      sfx.lever();
      sfx.reelStart();
      // Wind the whirr down over the length of the longest reel.
      const span = SPIN_BASE + Math.max(0, live.length - 1) * SPIN_STEP;
      const t0 = performance.now();
      const id = window.setInterval(() => {
        const u = (performance.now() - t0) / span;
        if (u >= 1) return window.clearInterval(id);
        sfx.reelSpeed(1 - u * 0.75);
      }, 150);
    }
  }, [anySpinning, credits, filters, pools, rolls, rollsWithMode, seed, spins]);

  const spinOne = useCallback(
    (slotId: string) => {
      if (!armed || pools[slotId]?.length === 0) return;
      const nextSpin = (spins[slotId] ?? 0) + 1;
      const entry = rollSlot(slotId, seed, nextSpin, filters, rollsWithMode, rolls[slotId]?.entry);
      setSpins((p) => ({ ...p, [slotId]: nextSpin }));
      setRolls((p) => ({ ...p, [slotId]: { slotId, entry, held: false } }));
      setDurations((d) => ({ ...d, [slotId]: SPIN_BASE }));
      setSpinning((p) => ({ ...p, [slotId]: true }));
    },
    [armed, filters, pools, rolls, rollsWithMode, seed, spins],
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
      if (settingsRef.current.sounds) sfx.tick();
    },
    [pools, rolls],
  );

  const toggleHold = useCallback((slotId: string) => {
    setRolls((prev) => {
      const cur = prev[slotId];
      if (!cur) return prev;
      return { ...prev, [slotId]: { ...cur, held: !cur.held } };
    });
    if (settingsRef.current.sounds) sfx.hold();
  }, []);

  const onTick = useCallback(() => {
    if (settingsRef.current.sounds) sfx.tick();
  }, []);

  const onSpinEnd = useCallback((slotId: string) => {
    setSpinning((prev) => {
      if (!prev[slotId]) return prev;
      const next = { ...prev, [slotId]: false };

      if (settingsRef.current.sounds) {
        const index = SLOTS.findIndex((s) => s.id === slotId);
        sfx.reelLand(Math.max(0, index));
        // Last reel home: kill the whirr and pay out.
        if (!Object.values(next).some(Boolean)) {
          sfx.reelStop();
          window.setTimeout(() => sfx.jackpot(), 130);
        }
      }
      return next;
    });
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
  }, [pools, armed]);

  const rollDice = useCallback(async () => {
    if (diceBusy) return;
    setDiceBusy(true);
    const n = (spins.__dice ?? 0) + 1;
    setSpins((p) => ({ ...p, __dice: n }));

    const a = rollDie(seed, 'loadout', n);
    const b = rollDie(seed, 'attach', n);

    if (settingsRef.current.sounds) sfx.diceThrow();
    // Bounce and settle sounds are fired by the tray itself, on real contacts.
    await diceRef.current?.roll(a, b);

    setDice([a, b]);
    setLoadoutCost(LOADOUT_COST_FACES[a - 1]);
    setAttachCost(ATTACHMENT_COST_FACES[b - 1]);
    setDiceBusy(false);
  }, [diceBusy, seed, spins]);

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

  const newSeed = useCallback(() => {
    const s = randomSeedCode();
    setSeed(s);
    setSpins({});
    setRolls({});
    setMode(null);
    setCoinReady(false);
    setCredits(0);
    setCreditMode(null);
    setArmed(false);
    setDice(null);
    setLoadoutCost(null);
    setAttachCost(null);
    const url = new URL(window.location.href);
    url.searchParams.set('seed', s);
    window.history.replaceState({}, '', url);
  }, []);

  const share = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seed);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy this link:', url.toString());
    }
  }, [seed]);

  /* ------------------------------------------------------------- render */

  const stage = wheelBusy
    ? 'Spinning…'
    : coinReady
      ? 'Take your token'
      : credits > 0
        ? 'Pull the lever'
        : mode
          ? 'Spin again for a new run'
          : 'Spin the wheel';

  return (
    <div className="app">
      <header className="hdr">
        <div>
          <h1 className="hdr__title">
            Loadout <span>Roulette</span>
          </h1>
          <p className="hdr__sub">Delta Force · Operations · spin, take the token, pull</p>
        </div>
        <div className="hdr__actions">
          <button type="button" className="btn" onClick={share}>
            {copied ? 'Link copied' : `Seed ${seed}`}
          </button>
          <button type="button" className="btn" onClick={newSeed}>
            New seed
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- stage one */}
      <section className="stage">
        <div className="stage__wheel">
          <RouletteWheel
            ref={wheelRef}
            className="wheelcanvas"
            onRattle={(s) => settingsRef.current.sounds && sfx.ballRattle(s)}
          />
          <div className="wheelglow" aria-hidden="true" />
        </div>

        <div className="stage__side">
          <h2 className="stage__h">1 · Roll for difficulty</h2>
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

      <div className="stageline">
        <span className="stageline__pill">{stage}</span>
      </div>

      {/* ---------------------------------------------------- stage two */}
      <section className="stage2">
        <h2 className="stage__h">2 · Roll your kit</h2>

        {missing.length > 0 && (
          <div className="warn" role="status">
            <strong>Nothing matches your filters</strong> for: {missing.join(', ')}.
          </div>
        )}

        <SlotMachine
          ref={coinSlotRef}
          rolls={rolls}
          pools={pools}
          spinning={spinning}
          durations={durations}
          instant={settings.instantSpin}
          locked={locked}
          credits={credits}
          creditMode={creditMode}
          anySpinning={anySpinning}
          onHold={toggleHold}
          onSpin={spinOne}
          onNudge={nudge}
          onSpinEnd={onSpinEnd}
          onTick={onTick}
          onPull={pull}
        />
      </section>

      {/* -------------------------------------------------- stage three */}
      <section className="stage stage--dice">
        <div className="stage__wheel stage__wheel--dice">
          <DiceTray
            ref={diceRef}
            className="wheelcanvas"
            onBounce={(s) => settingsRef.current.sounds && sfx.diceBounce(s)}
            onSettle={() => settingsRef.current.sounds && sfx.diceSettle()}
          />
          <div className="wheelglow" aria-hidden="true" />
        </div>

        <div className="stage__side">
          <h2 className="stage__h">3 · Roll for spending caps</h2>

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

          <p className="stage__foot">
            Caps are in Tekniq Alloy. Low rolls are meant to hurt — a 1 on the white die is a
            genuine scav run.
          </p>
        </div>
      </section>

      <SettingsPanel
        open={panelOpen}
        onToggle={() => setPanelOpen((o) => !o)}
        settings={settings}
        onSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
        filters={filters}
        onFilters={setFilters}
        onPreset={(id) => setFilters(applyPreset(id))}
        onReset={() => setFilters(defaultFilterState())}
      />

      <footer className="ftr">
        <p>
          An unofficial fan tool. Delta Force is a trademark of its publisher; this project is not
          affiliated with or endorsed by them. Game data is community-sourced and may lag behind the
          live build — edit <code>src/data/deltaforce.ts</code> to correct it.
        </p>
      </footer>
    </div>
  );
}
