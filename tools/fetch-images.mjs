/**
 * Mirrors every attachment icon into public/att/.
 *
 * The icons live on static.deltaforcetools.gg under hashed filenames, so the
 * URL cannot be derived from the item name — each one has to be read off that
 * item's wiki page. This walks the 412 pages once, pulls the image URL out of
 * the markup, and downloads it.
 *
 * They are mirrored rather than hotlinked for two reasons. A cross-origin
 * image cannot be used as a WebGL texture unless the host sends CORS headers,
 * which theirs does not promise; and a hashed filename is exactly the kind of
 * thing that changes without warning, which would leave the capsules empty.
 *
 * Run by hand — icons do not change daily:
 *   node tools/fetch-images.mjs
 * Already-downloaded files are skipped, so re-running only fetches what is new.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';

const OUT = 'public/att';
const DELAY_MS = 250;
const UA = 'loadout-roulette icon mirror (+https://github.com/eukyrios/loadout-roulette)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pull the id/name/wiki triples straight out of the generated data module —
// one source of truth, so the mirror cannot drift from what the app renders.
const ts = await readFile('src/data/attachments.ts', 'utf8');
const items = [];
for (const m of ts.matchAll(/\{\s*id:\s*"(.*?)",\s*name:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?wiki:\s*"(.*?)"\s*\}/g)) {
  items.push({ id: m[1], name: m[2], wiki: m[3] });
}
if (items.length < 400) {
  console.error(`Only parsed ${items.length} attachments from the data module — aborting.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const have = new Set((await readdir(OUT).catch(() => [])).map((f) => f.replace(/\.png$/, '')));

/** The item icon, from the page's markup. */
function findImage(html) {
  // Direct CDN reference first...
  const direct = html.match(/https:\/\/static\.deltaforcetools\.gg\/images\/[A-Za-z0-9._-]+\.(?:png|webp|jpg)/);
  if (direct) return direct[0];
  // ...then the Next.js optimiser wrapper, which percent-encodes the real URL.
  const wrapped = html.match(/\/_next\/image\?url=([^&"']+)/);
  if (wrapped) {
    try {
      const u = decodeURIComponent(wrapped[1]);
      if (u.startsWith('http')) return u;
    } catch {
      /* fall through */
    }
  }
  return null;
}

let got = 0;
let skipped = 0;
const failed = [];

for (const [i, item] of items.entries()) {
  if (have.has(item.id)) {
    skipped++;
    continue;
  }
  try {
    const page = await fetch(item.wiki, { headers: { 'user-agent': UA, accept: 'text/html' } });
    if (!page.ok) throw new Error(`page HTTP ${page.status}`);
    const url = findImage(await page.text());
    if (!url) throw new Error('no image in markup');

    const img = await fetch(url, { headers: { 'user-agent': UA } });
    if (!img.ok) throw new Error(`image HTTP ${img.status}`);
    await writeFile(`${OUT}/${item.id}.png`, Buffer.from(await img.arrayBuffer()));
    got++;
    if (got % 25 === 0) console.log(`${i + 1}/${items.length} — ${got} downloaded`);
  } catch (err) {
    failed.push(`${item.name}: ${err.message}`);
  }
  await sleep(DELAY_MS);
}

console.log(`\ndownloaded ${got}, already had ${skipped}, failed ${failed.length}`);
for (const f of failed.slice(0, 20)) console.log('  !', f);
// A handful of misses is survivable — the capsule falls back to a text card.
// Half the catalogue missing means the markup moved and wants looking at.
if (failed.length > items.length / 2) process.exit(1);
