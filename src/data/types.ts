/**
 * Core domain types.
 *
 * Everything the randomizer knows about is an `Entry`. Slots are configured
 * declaratively in `slots.ts`, so adding a new randomizable category
 * (grenades, gadgets, a whole different game) is a data change, not a
 * code change.
 */

/** Any single randomizable thing. Extra fields live in `attrs`. */
export interface Entry {
  id: string;
  name: string;
  /** Optional secondary line rendered under the name. */
  note?: string;
  /**
   * Arbitrary, filterable attributes. Numbers and strings only, so filters
   * stay serializable into URLs and localStorage.
   */
  attrs?: Record<string, string | number>;
  /** Relative pick weight. Defaults to 1. */
  weight?: number;
}

/** A constraint the user can toggle in the settings panel. */
export type FilterSpec =
  | {
      kind: 'range';
      /** Key inside `Entry.attrs` this range applies to. */
      attr: string;
      label: string;
      min: number;
      max: number;
      /** Optional formatter for the displayed bound, e.g. `Tier 4`. */
      format?: (v: number) => string;
    }
  | {
      kind: 'multi';
      /** Key inside `Entry.attrs` this set applies to. */
      attr: string;
      label: string;
      /** Allowed values, in display order. */
      values: string[];
    };

/** Declarative definition of one reel on the board. */
export interface SlotSpec {
  id: string;
  /** Plural label shown above the reel, e.g. "operators". */
  label: string;
  /** Pool of candidates for this slot. */
  entries: Entry[];
  /** User-adjustable constraints for this slot. */
  filters?: FilterSpec[];
  /**
   * Slots sharing a `group` are laid out together and can be spun as a unit.
   */
  group?: string;
  /** Rendered small under the reel when set. */
  hint?: string;
  /**
   * Gate this slot's pool on another slot's result. The parent must appear
   * EARLIER in the SLOTS array — pools resolve in declaration order, and the
   * reels stop in that order too, so the parent has always landed first.
   */
  dependsOn?: {
    slotId: string;
    /** Keep `entry` in the pool only when this returns true. */
    match: (entry: Entry, parent: Entry) => boolean;
  };
}

/** A single resolved pick. */
export interface Roll {
  slotId: string;
  entry: Entry | null;
  /** True when the user pinned this pick so "spin all" skips it. */
  held: boolean;
}

/** Serializable snapshot of every user-adjustable constraint. */
export interface FilterState {
  /** `${slotId}:${attr}` -> [min, max] */
  ranges: Record<string, [number, number]>;
  /** `${slotId}:${attr}` -> allowed values */
  multi: Record<string, string[]>;
}
