/**
 * Copy the attachment data in from weapon-smith.
 *
 * WHY THIS DIRECTION
 *
 * attachments.ts and attach-rules.ts are authored in the sibling weapon-smith
 * repo — that project exists to hold them, and its pages and its optimiser are
 * built from them. This app only consumes them, for the attachment reels.
 *
 * They are copied rather than imported so this repo still builds alone: a
 * clone with no sibling, and CI, both work off the committed copies. The cost
 * is that the copies go stale silently, which is what the banner and this
 * script are for.
 *
 *   node tools/sync-attachment-data.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SIBLING = resolve(ROOT, '..', 'weapon-smith');
const FILES = ['attachments.ts', 'attach-rules.ts'];

const BANNER = (name) => `/* -----------------------------------------------------------------------
 * COPIED FROM weapon-smith. Do not edit here.
 *
 * The source of truth is ../weapon-smith/src/data/${name}. Edit it there, then
 * run \`node tools/sync-attachment-data.mjs\` in this repo. An edit made here is
 * lost on the next sync, and worse, is invisible to the site generated from
 * the original.
 * ----------------------------------------------------------------------- */

`;

if (!existsSync(SIBLING)) {
  console.error(`not found: ${SIBLING}\n` +
    'This script needs weapon-smith beside loadout-roulette. The committed ' +
    'copies in src/data/ still work without it.');
  process.exit(1);
}

for (const name of FILES) {
  const from = join(SIBLING, 'src', 'data', name);
  if (!existsSync(from)) {
    console.error(`missing ${from}`);
    process.exit(1);
  }
  const body = readFileSync(from, 'utf8');
  writeFileSync(join(ROOT, 'src', 'data', name), BANNER(name) + body);
  console.log(`copied ${name}`);
}
