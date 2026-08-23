/**
 * The three switches on the bar at the bottom of the page.
 *
 * A plain module-level store rather than context: the 3D scenes are imperative
 * three.js code living outside React's tree, and they need to read the current
 * value inside a render loop that runs sixty times a second. A subscription
 * they can poll is the honest shape for that; a context would mean threading a
 * prop into six canvases and re-running their setup effects to change a
 * volume.
 *
 * Remembered across visits, because someone who turns animations off does not
 * want to do it again every time.
 */

import { useSyncExternalStore } from 'react';
import { setAudioLevel } from './sound';

export interface AppSettings {
  /** False plays every result out instantly instead of animating it. */
  animate: boolean;
  /**
   * How long everything plays for, as a multiple of its written length.
   *
   * A MULTIPLIER ON TIME, not on rate: 2 means twice as long, not twice as
   * fast. The written lengths are brisk — a reel is over almost as it starts —
   * and a roll is more fun when you have to wait for it, so the default runs
   * everything longer than written. Below 1 for a quick roll, up to
   * LENGTH_MAX for a drawn-out one.
   *
   * Rarity still multiplies on top: a red reel runs three times whatever this
   * says, at every setting.
   */
  length: number;
  sound: boolean;
  /** 0 to 1. */
  volume: number;
}

export const LENGTH_MIN = 0.5;
export const LENGTH_MAX = 5;

/**
 * The system's own preference for less motion.
 *
 * It picks the DEFAULT length and nothing more. It used to clamp the value
 * instead, which quietly broke the control it was meant to inform: the clamp
 * sat at 0.385 and the slider bottoms out at 0.5, so every setting collapsed
 * to the same number and neither the slider nor the rarity stretch could move
 * anything. A preference should choose where a control starts, not overrule
 * where its owner puts it — and Animation off, one button along, is still
 * there for anyone who wants no motion at all.
 */
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KEY = 'lr:settings';

const DEFAULTS: AppSettings = { animate: true, length: 2.5, sound: true, volume: 0.85 };

/** What the length starts at, before anyone has touched the slider. */
const defaultLength = () => (prefersReduced() ? LENGTH_MIN : DEFAULTS.length);

function load(): AppSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS, length: defaultLength() };
    const got = JSON.parse(raw) as Partial<AppSettings>;
    return {
      animate: typeof got.animate === 'boolean' ? got.animate : DEFAULTS.animate,
      length:
        typeof got.length === 'number' && got.length >= LENGTH_MIN && got.length <= LENGTH_MAX
          ? got.length
          : defaultLength(),
      sound: typeof got.sound === 'boolean' ? got.sound : DEFAULTS.sound,
      volume:
        typeof got.volume === 'number' && got.volume >= 0 && got.volume <= 1
          ? got.volume
          : DEFAULTS.volume,
    };
  } catch {
    return DEFAULTS;
  }
}

let state: AppSettings = load();
const subs = new Set<() => void>();

export const getSettings = (): AppSettings => state;

export function setSettings(patch: Partial<AppSettings>): void {
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage can be off; the setting still applies for this visit */
  }
  setAudioLevel(state.sound ? state.volume : 0);
  for (const f of subs) f();
}

function subscribe(f: () => void): () => void {
  subs.add(f);
  return () => subs.delete(f);
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULTS);
}

/**
 * How fast the 3D scenes should run, as a multiplier on real time.
 *
 * Read inside the render loop rather than captured at mount, so flipping the
 * switch takes effect on the next frame instead of the next reload.
 *
 * With animation off this is not zero and not a skip — the sequences still run
 * end to end, just far faster than a frame, so every callback still fires in
 * order and every promise still settles. Short-circuiting them instead would
 * mean a second code path per stage and a second set of bugs.
 */
function animLength(): number {
  // Not zero and not a skip — see above. A sixtieth of the written length puts
  // every sequence inside a frame while still running it end to end.
  if (!state.animate) return 1 / 60;
  // Whatever the slider says, with nothing second-guessing it. See
  // prefersReduced for why this is not clamped.
  return state.length;
}

/** The same thing as a rate, for loops that advance by dt. */
export function animSpeed(): number {
  return 1 / animLength();
}

/**
 * The same thing for the reels, which think in milliseconds.
 *
 * The floor is 90ms rather than one frame on purpose. The seven columns hand
 * off to each other as each one finishes, and squeezing a spin into a single
 * frame let two hand-offs land in the same tick, which dropped one and left a
 * column spinning forever. At 90ms a full pull is still under a second and
 * reads as instant, and every column still gets its own frames.
 */
export function animMs(ms: number): number {
  return Math.max(90, ms * animLength());
}

// The audio graph is built lazily, so push the stored level in at startup too.
setAudioLevel(state.sound ? state.volume : 0);
