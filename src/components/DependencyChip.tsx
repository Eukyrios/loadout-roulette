/**
 * The little box on a stage that says what it is working from.
 *
 * Several stages only make sense once an earlier one has landed: the kit needs
 * a difficulty, the attachments need a gun, the ammunition needs a caliber,
 * the keycards need a map. This shows which one is in force, "None" when
 * nothing is, and — the point of it — lets you set it by hand.
 *
 * That means you do not have to play the stages in order. If your loadout is
 * already decided and you only want to roll ammunition, type the caliber in
 * and spin; the earlier stages can stay untouched.
 *
 * It deliberately borrows the slot machine's readout markup and classes rather
 * than inventing a look of its own, so a chip on stage five is the same object
 * as the difficulty tag on stage two. The only additions are the affordances
 * that make it typeable.
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface DependencyOption {
  /** What the caller gets back. */
  id: string;
  /** What the reader sees and types. */
  name: string;
  /** Optional right-hand hint in the list, e.g. a class or caliber. */
  note?: string;
}

interface Props {
  /** Small caps label: "Difficulty", "Weapon", "Caliber", "Map". */
  label: string;
  /** The name to show, or null for "None". */
  value: string | null;
  options: DependencyOption[];
  onPick: (id: string) => void;
  /** Clears the manual override. Omitted when there is nothing to clear. */
  onClear?: () => void;
  /** Extra modifier for the chip, e.g. the difficulty's colour. */
  tone?: string;
  /**
   * True for a chip in a stage's side column rather than on the machine's
   * crown: compact instead of full width, and reading left to right.
   */
  side?: boolean;
  /** Where the value came from, shown as a hint under the label. */
  source?: 'rolled' | 'manual' | null;
}

/** Case- and punctuation-insensitive, so "762x51" finds "7.62x51mm M80". */
const fold = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function DependencyChip({
  label,
  value,
  options,
  onPick,
  onClear,
  tone,
  side,
  source,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const matches = useMemo(() => {
    const q = fold(text);
    // No query yet means "show me what there is", not "show me nothing".
    const hits = q ? options.filter((o) => fold(o.name).includes(q)) : options;
    // Anything that STARTS with the query first — typing "m4" should offer the
    // M4A1 before the AKM's M4-pattern parts.
    return hits
      .slice()
      .sort((a, b) => {
        const as = fold(a.name).startsWith(q) ? 0 : 1;
        const bs = fold(b.name).startsWith(q) ? 0 : 1;
        return as - bs || a.name.localeCompare(b.name);
      })
      .slice(0, 40);
  }, [text, options]);

  // Clicking anywhere else, or pressing Escape, puts it back.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const choose = (id: string) => {
    onPick(id);
    setOpen(false);
    setText('');
  };

  const commit = () => {
    const hit = matches[active] ?? matches[0];
    if (hit) choose(hit.id);
  };

  return (
    <div
      className={`machine__mode dep${side ? ' dep--side' : ''}${
        tone ? ` machine__mode--${tone}` : ''
      }`}
      ref={wrap}
    >
      <span className="machine__mode-label">
        {label}
        {source === 'manual' ? <span className="dep__flag"> set</span> : null}
      </span>

      {open ? (
        <div className="dep__edit">
          <input
            ref={input}
            className="dep__input"
            value={text}
            placeholder="Type to search"
            aria-label={`Set ${label}`}
            aria-controls={listId}
            autoComplete="off"
            onChange={(e) => {
              setText(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((i) => Math.min(matches.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              }
            }}
          />
          <ul className="dep__list" id={listId} role="listbox">
            {matches.length === 0 ? (
              <li className="dep__none">Nothing matches</li>
            ) : (
              matches.map((o, i) => (
                <li key={o.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`dep__opt${i === active ? ' is-active' : ''}`}
                    // mousedown, not click: the input's blur would otherwise
                    // close the list before the click landed.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(o.id);
                    }}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="dep__optName">{o.name}</span>
                    {o.note ? <span className="dep__optNote">{o.note}</span> : null}
                  </button>
                </li>
              ))
            )}
          </ul>
          {onClear && value ? (
            <button type="button" className="dep__clear" onMouseDown={(e) => {
              e.preventDefault();
              onClear();
              setOpen(false);
              setText('');
            }}>
              Clear
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="machine__mode-value dep__value"
          title={`${label}: click to set by hand`}
          onClick={() => setOpen(true)}
        >
          {value ?? 'None'}
        </button>
      )}
    </div>
  );
}
