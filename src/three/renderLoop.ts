/**
 * Frame loop for the 3D stages, with an off switch.
 *
 * Four WebGL scenes on one page is four independent render loops, and left to
 * themselves every one of them draws sixty times a second forever — including
 * the three you are not looking at. On a desktop that is invisible; on a phone,
 * where the stages are a screen apart and only ever one is in view, it was
 * about a hundred draw calls a frame of pure waste, and the heat and throttling
 * that come with it.
 *
 * So a scene runs only while it is actually on screen and the page is visible.
 * The one exception is an animation in flight: a stage scrolled away
 * mid-throw has to keep going, because its promise resolves from inside the
 * loop and the UI is sitting on that promise. `busy` is how a scene says so.
 */

export interface RenderLoop {
  /** Restart immediately — call when an animation begins. */
  wake: () => void;
  stop: () => void;
}

export function renderLoop(
  el: HTMLElement,
  step: (now: number, dt: number) => void,
  busy: () => boolean = () => false,
  /**
   * Called whenever the loop restarts after being stopped. Scenes that only
   * draw when something changes use this to force one frame: a canvas that has
   * not rendered for a while is showing a buffer the browser is free to drop,
   * and coming back to a blank stage would be worse than the work saved.
   */
  onResume?: () => void,
): RenderLoop {
  let raf = 0;
  let running = false;
  let onScreen = true; // assume visible until the observer says otherwise
  let last = performance.now();

  const wanted = () => (onScreen && !document.hidden) || busy();

  const tick = (now: number) => {
    // Capped, so returning to a stage after a while does not resume with one
    // enormous timestep that teleports whatever was mid-animation.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(now, dt);
    if (wanted()) {
      raf = requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    onResume?.();
    raf = requestAnimationFrame(tick);
  };

  const sync = () => {
    if (wanted()) start();
  };

  // A margin, so a stage is already running by the time it scrolls into view
  // rather than popping in a frame late.
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      sync();
    },
    { rootMargin: '150px' },
  );
  io.observe(el);
  document.addEventListener('visibilitychange', sync);
  start();

  return {
    wake: sync,
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    },
  };
}
