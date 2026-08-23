/**
 * Mirrors every item picture into public/ — attachments and ammunition.
 *
 * WHY THE APP CANNOT JUST LINK TO THEM
 *
 * The pictures live on someone else's CDN. Linking straight to them looked
 * fine in testing and did not work in practice: a host is free to refuse a
 * hotlink from another origin, and this one appears to, so the cards came up
 * empty. Mirroring also keeps the app from making any request to a third party
 * at all, which is why the upstream URLs live in these two JSON files and not
 * in the shipped bundle.
 *
 *   tools/att-sources.json    414 attachment pictures  -> public/att/<id>.png
 *   tools/ammo-sources.json    59 ammunition pictures  -> public/ammo/<id>.png
 *
 * Run it once and the pictures appear. Already-downloaded files are skipped,
 * so re-running only fetches what is new:
 *
 *   npm run icons
 *
 * Until then nothing is broken — an attachment card draws its slot glyph and a
 * round draws a cartridge. That is a designed fallback, not a failure state.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';

const DELAY_MS = 60;
const UA = 'loadout-roulette picture mirror (+https://github.com/eukyrios/loadout-roulette)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SETS = [
  { name: 'attachments', map: 'tools/att-sources.json', out: 'public/att', min: 400 },
  { name: 'ammunition', map: 'tools/ammo-sources.json', out: 'public/ammo', min: 50 },
];

async function download(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'image/*' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  // A hotlink block or an error page can arrive with a 200. Magic bytes are
  // the cheapest way to tell a picture from an apology.
  const png = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50;
  const webp = buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP';
  const jpg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8;
  if (!png && !webp && !jpg) throw new Error(`not an image (${buf.length} bytes)`);
  return buf;
}

let failedTotal = 0;
let wantedTotal = 0;

for (const set of SETS) {
  let sources;
  try {
    sources = JSON.parse(await readFile(set.map, 'utf8'));
  } catch {
    console.error(`! ${set.map} is missing or unreadable — skipping ${set.name}`);
    continue;
  }
  const ids = Object.keys(sources);
  if (ids.length < set.min) {
    console.error(`! ${set.map} only has ${ids.length} entries — aborting`);
    process.exit(1);
  }

  await mkdir(set.out, { recursive: true });
  const have = new Set((await readdir(set.out).catch(() => [])).map((f) => f.replace(/\.png$/, '')));

  let got = 0;
  let skipped = 0;
  const failed = [];
  console.log(`\n${set.name}: ${ids.length} pictures -> ${set.out}`);

  for (const [i, id] of ids.entries()) {
    if (have.has(id)) {
      skipped++;
      continue;
    }
    try {
      await writeFile(`${set.out}/${id}.png`, await download(sources[id]));
      got++;
      if (got % 50 === 0) console.log(`  ${i + 1}/${ids.length} — ${got} downloaded`);
    } catch (err) {
      failed.push(`${id}: ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`  downloaded ${got}, already had ${skipped}, failed ${failed.length}`);
  for (const f of failed.slice(0, 10)) console.log('    !', f);
  failedTotal += failed.length;
  wantedTotal += ids.length;
}

// A handful of misses is survivable — those items fall back to a drawn glyph.
// Half the catalogue missing means the URLs have moved and want looking at.
if (failedTotal > wantedTotal / 2) {
  console.error('\nMore than half failed. The upstream URLs have probably changed.');
  process.exit(1);
}
console.log('\nDone. Rebuild (npm run build) and the pictures are in.');
