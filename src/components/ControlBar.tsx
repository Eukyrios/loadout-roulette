/**
 * The bar pinned to the bottom of the window.
 *
 * Four controls that apply to the whole page and are wanted at any moment,
 * not buried in a panel: skip the animations, set how long they run, mute, and
 * set the level. It stays put while you scroll because the thing you want to turn
 * down is usually the thing playing right now.
 *
 * Turning animations off does not skip anything — the sequences still run in
 * order, just far faster than a frame, so a result lands in its final state
 * without a separate code path per stage.
 */

import { LENGTH_MAX, LENGTH_MIN, setSettings, useSettings } from '../engine/settings';
import { sfx } from '../engine/sound';

export function ControlBar() {
  const { animate, length, sound, volume } = useSettings();

  return (
    <div className="bar" role="group" aria-label="Playback">
      <div className="bar__inner">
        <span className="bar__brand">Loadout Roulette</span>

        <div className="bar__group">
          <button
            type="button"
            className={`bar__btn${animate ? ' is-on' : ''}`}
            aria-pressed={animate}
            onClick={() => setSettings({ animate: !animate })}
            title={animate ? 'Skip the animations' : 'Play the animations'}
          >
            <span className="bar__dot" aria-hidden="true" />
            Animation
          </button>

          <button
            type="button"
            className={`bar__btn${sound ? ' is-on' : ''}`}
            aria-pressed={sound}
            onClick={() => {
              setSettings({ sound: !sound });
              // A click you can hear is the fastest confirmation that it is
              // back on. Fired after the level is set, or it would be silent.
              if (!sound) sfx.click();
            }}
            title={sound ? 'Mute' : 'Unmute'}
          >
            <span className="bar__dot" aria-hidden="true" />
            Sound
          </button>

          <label className="bar__vol">
            <span className="bar__volLabel">Length</span>
            <input
              type="range"
              min={LENGTH_MIN * 10}
              max={LENGTH_MAX * 10}
              step={1}
              value={Math.round(length * 10)}
              disabled={!animate}
              aria-label="Animation length"
              aria-valuetext={`${length.toFixed(1)} times as long`}
              title="How long the animations run. Higher is longer."
              onChange={(e) => setSettings({ length: Number(e.target.value) / 10 })}
            />
            <span className="bar__volValue">{length.toFixed(1)}&times;</span>
          </label>

          <label className="bar__vol">
            <span className="bar__volLabel">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              disabled={!sound}
              aria-label="Volume"
              onChange={(e) => setSettings({ volume: Number(e.target.value) / 100 })}
              // Only on release: a tick per pixel of drag is a machine gun.
              onPointerUp={() => sound && sfx.tick()}
            />
            <span className="bar__volValue">{Math.round(volume * 100)}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
