/**
 * All audio is synthesized in WebAudio — there are no sound files to ship,
 * which keeps the bundle small and means nothing 404s on a static host.
 *
 * Every call is a no-op if the browser blocks audio or the context cannot be
 * created, so callers never need to guard.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(ctx.destination);
    }
    // Browsers suspend the context until a user gesture; every entry point
    // here is behind a click, so resuming lazily is safe.
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function out(): AudioNode | null {
  const ac = audio();
  return ac ? (master ?? ac.destination) : null;
}

/** White noise, generated once and reused for every rattle and whirr. */
function noise(ac: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const len = ac.sampleRate * 2;
    noiseBuffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/* -------------------------------------------------------------- one-shots */

function tone(
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'square',
  delay = 0,
) {
  const ac = audio();
  const dest = out();
  if (!ac || !dest) return;
  try {
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(dest);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {
    /* ignore */
  }
}

function sweep(
  from: number,
  to: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sawtooth',
) {
  const ac = audio();
  const dest = out();
  if (!ac || !dest) return;
  try {
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + duration);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(dest);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {
    /* ignore */
  }
}

/** A short filtered-noise burst: taps, knocks, clatter. */
function knock(freq: number, duration: number, gain: number, q = 6) {
  const ac = audio();
  const dest = out();
  if (!ac || !dest) return;
  try {
    const t0 = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = noise(ac);
    src.loop = true;

    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;

    const amp = ac.createGain();
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(bp).connect(amp).connect(dest);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ loops */

/**
 * A sustained filtered-noise bed whose brightness and volume can be moved
 * while it plays — used for the ball rolling round the track and for the
 * reels whirring.
 */
class NoiseLoop {
  private src: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private amp: GainNode | null = null;

  start(freq: number, gain: number, q = 1.4) {
    const ac = audio();
    const dest = out();
    if (!ac || !dest || this.src) return;
    try {
      this.src = ac.createBufferSource();
      this.src.buffer = noise(ac);
      this.src.loop = true;

      this.filter = ac.createBiquadFilter();
      this.filter.type = 'bandpass';
      this.filter.frequency.value = freq;
      this.filter.Q.value = q;

      this.amp = ac.createGain();
      this.amp.gain.setValueAtTime(0.0001, ac.currentTime);
      this.amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.12);

      this.src.connect(this.filter).connect(this.amp).connect(dest);
      this.src.start();
    } catch {
      this.src = null;
    }
  }

  /** Move the loop's pitch and level, e.g. as a wheel slows down. */
  to(freq: number, gain: number, seconds = 0.25) {
    const ac = audio();
    if (!ac || !this.filter || !this.amp) return;
    try {
      const t = ac.currentTime;
      this.filter.frequency.cancelScheduledValues(t);
      this.filter.frequency.linearRampToValueAtTime(Math.max(40, freq), t + seconds);
      this.amp.gain.cancelScheduledValues(t);
      this.amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + seconds);
    } catch {
      /* ignore */
    }
  }

  stop(fade = 0.25) {
    const ac = audio();
    const src = this.src;
    const amp = this.amp;
    this.src = null;
    this.filter = null;
    this.amp = null;
    if (!ac || !src) return;
    try {
      if (amp) {
        amp.gain.cancelScheduledValues(ac.currentTime);
        amp.gain.setValueAtTime(Math.max(0.0002, amp.gain.value), ac.currentTime);
        amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + fade);
      }
      src.stop(ac.currentTime + fade + 0.05);
    } catch {
      /* ignore */
    }
  }
}

const wheelLoop = new NoiseLoop();
const reelLoop = new NoiseLoop();

/* ------------------------------------------------------------------- kit */

export const sfx = {
  /* --- generic UI --- */
  tick: () => tone(820 + Math.random() * 260, 0.03, 0.028),
  hold: () => tone(330, 0.07, 0.05, 'sine'),
  click: () => knock(1500, 0.04, 0.16),

  /* --- roulette --- */
  /** Ball released: rising whoosh, then the rolling bed takes over. */
  wheelStart: () => {
    sweep(150, 780, 0.5, 0.05, 'triangle');
    wheelLoop.start(1500, 0.05, 1.2);
  },
  /** Follow the ball's speed, 1 at full pelt down to 0 as it settles. */
  wheelSpeed: (speed: number) => {
    const s = Math.max(0, Math.min(1, speed));
    wheelLoop.to(420 + s * 1900, 0.012 + s * 0.05, 0.3);
  },
  /** Ball knocking around the deflectors and frets. */
  ballRattle: (strength = 1) => {
    knock(900 + Math.random() * 1400, 0.05, 0.05 + 0.11 * strength, 9);
  },
  /** Ball drops home. */
  wheelStop: () => {
    wheelLoop.stop(0.18);
    knock(600, 0.1, 0.16, 5);
    tone(420, 0.1, 0.05, 'triangle', 0.04);
    tone(630, 0.16, 0.045, 'triangle', 0.11);
  },

  /* --- coin & lever --- */
  /** Token drops into the dispenser tray. */
  coinDrop: () => {
    knock(2400, 0.05, 0.1, 12);
    tone(1180, 0.09, 0.045, 'triangle', 0.02);
    tone(1620, 0.12, 0.035, 'triangle', 0.09);
  },
  /** Token accepted by the slot: swallow, then the mechanism arms. */
  coin: () => {
    knock(2000, 0.05, 0.12, 10);
    tone(1320, 0.07, 0.05, 'triangle', 0.03);
    tone(1760, 0.09, 0.042, 'triangle', 0.1);
    tone(990, 0.18, 0.035, 'sine', 0.19);
    knock(320, 0.1, 0.09, 4);
  },
  /** Mechanical clunk of the arm bottoming out. */
  lever: () => {
    sweep(430, 90, 0.22, 0.075, 'square');
    knock(240, 0.13, 0.11, 3);
  },

  /* --- reels --- */
  reelStart: () => reelLoop.start(900, 0.035, 0.9),
  reelSpeed: (speed: number) => {
    const s = Math.max(0, Math.min(1, speed));
    reelLoop.to(350 + s * 1100, 0.008 + s * 0.032, 0.25);
  },
  reelStop: () => reelLoop.stop(0.15),
  /** One reel settling on the payline. */
  reelLand: (index = 0) => {
    knock(430, 0.07, 0.13, 5);
    // Each reel lands a step higher, so the row reads as a run.
    tone(392 * Math.pow(2, index / 12), 0.14, 0.05, 'triangle', 0.02);
  },
  /** All seven home — a short rising fanfare. */
  jackpot: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      tone(f, 0.3, 0.055, 'triangle', i * 0.075);
      tone(f * 2, 0.22, 0.022, 'sine', i * 0.075 + 0.01);
    });
    knock(3200, 0.5, 0.05, 3);
  },

  /* --- dice --- */
  diceThrow: () => sweep(700, 240, 0.22, 0.045, 'triangle'),
  /** One die striking the felt. */
  diceBounce: (strength = 1) => {
    const s = Math.max(0.05, Math.min(1, strength));
    knock(260 + Math.random() * 220, 0.07 + 0.05 * s, 0.05 + 0.14 * s, 3.2);
    tone(150 + Math.random() * 90, 0.05, 0.03 * s, 'square');
  },
  /** Both dice at rest. */
  diceSettle: () => {
    knock(200, 0.09, 0.06, 3);
    tone(660, 0.14, 0.04, 'triangle', 0.03);
  },

  /* --- stick draw --- */
  /** Bamboo clattering as the cup is worked. Higher and drier than the dice. */
  stickRattle: (strength = 1) => {
    const s = Math.max(0.08, Math.min(1, strength));
    knock(1200 + Math.random() * 1500, 0.045, 0.03 + 0.08 * s, 14);
    knock(2600 + Math.random() * 900, 0.03, 0.02 + 0.05 * s, 18);
  },
  /** One stick sliding up and out of the bundle. */
  stickDraw: () => {
    sweep(320, 1150, 0.34, 0.035, 'triangle');
    knock(1800, 0.14, 0.05, 7);
    tone(880, 0.2, 0.04, 'triangle', 0.22);
    tone(1320, 0.26, 0.03, 'sine', 0.3);
  },
};
