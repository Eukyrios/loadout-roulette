/**
 * Mirrors every attachment icon into public/att/.
 *
 * WHY THIS IS THE ONLY RELIABLE SOURCE OF PICTURES
 *
 * The cards try three sources in order: this mirror, the raw CDN file, and the
 * site's own Next.js image optimiser. Only the first is guaranteed. The CDN
 * serves the file happily to a plain request, but a host is free to refuse a
 * hotlink from another origin, and it costs nothing to stop doing so tomorrow.
 * Once this has run the pictures are same-origin files in the repo and nothing
 * outside it can take them away.
 *
 * The URLs are already in src/data/attachments.ts — they were read off the
 * wiki pages when the data was scraped — so this downloads them directly and
 * only falls back to re-reading a page when a URL has gone stale.
 *
 * Run by hand, or from the "Mirror attachment icons" workflow:
 *   node tools/fetch-images.mjs
 * Already-downloaded files are skipped, so re-running only fetches what is new.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';

const OUT = 'public/att';
const DELAY_MS = 60;
const UA = 'loadout-roulette icon mirror (+https://github.com/eukyrios/loadout-roulette)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pull the id/img/wiki triples straight out of the generated data module —
// one source of truth, so the mirror cannot drift from what the app renders.
const ts = await readFile('src/data/attachments.ts', 'utf8');
const items = [];
for (const m of ts.matchAll(
  /\{\s*id:\s*"(.*?)",\s*name:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?img:\s*"(.*?)",\s*wiki:\s*"(.*?)"\s*\}/g,
)) {
  items.push({ id: m[1], name: m[2], img: m[3], wiki: m[4] });
}
if (items.length < 400) {
  console.error(`Only parsed ${items.length} attachments from the data module — aborting.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const have = new Set((await readdir(OUT).catch(() => [])).map((f) => f.replace(/\.png$/, '')));

/** The item icon, from the page's markup — used only when the stored URL dies. */
function findImage(html) {
  // Direct CDN reference first...
  const direct = html.match(
    /https:\/\/static\.deltaforcetools\.gg\/images\/[A-Za-z0-9._-]+\.(?:png|webp|jpg)/,
  );
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

async function download(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'image/*' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  // A hotlink block or an error page can arrive with a 200. PNG magic bytes
  // are the cheapest way to tell a picture from an apology.
  const png = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50;
  const webp = buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP';
  const jpg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8;
  if (!png && !webp && !jpg) throw new Error(`not an image (${buf.length} bytes)`);
  return buf;
}

let got = 0;
let relinked = 0;
let skipped = 0;
const failed = [];

for (const [i, item] of items.entries()) {
  if (have.has(item.id)) {
    skipped++;
    continue;
  }
  try {
    let buf;
    try {
      buf = await download(item.img);
    } catch {
      // The stored URL has a content hash in it, so it does go stale. Re-read
      // the item's page for the current one.
      const page = await fetch(item.wiki, { headers: { 'user-agent': UA, accept: 'text/html' } });
      if (!page.ok) throw new Error(`page HTTP ${page.status}`);
      const url = findImage(await page.text());
      if (!url) throw new Error('no image in markup');
      buf = await download(url);
      relinked++;
    }
    await writeFile(`${OUT}/${item.id}.png`, buf);
    got++;
    if (got % 50 === 0) console.log(`${i + 1}/${items.length} — ${got} downloaded`);
  } catch (err) {
    failed.push(`${item.name}: ${err.message}`);
  }
  await sleep(DELAY_MS);
}

console.log(
  `\ndownloaded ${got} (${relinked} needed a fresh URL), already had ${skipped}, failed ${failed.length}`,
);
for (const f of failed.slice(0, 20)) console.log('  !', f);
// A handful of misses is survivable — the card falls back to its slot glyph.
// Half the catalogue missing means the CDN moved and wants looking at.
if (failed.length > items.length / 2) process.exit(1);
