/**
 * Warn, loudly, when a build is about to ship with empty picture mirrors.
 *
 * WHY THIS EXISTS
 *
 * Every picture in this app is a local file under public/. Nothing is hotlinked
 * — see tools/fetch-images.mjs for why. The consequence is that a fresh clone
 * has no pictures at all until `npm run icons` has been run once, and a build
 * made before that runs is silently picture-less. It still WORKS: a card draws
 * its slot glyph, a round draws a cartridge, a reel cell shows its name. Those
 * are designed fallbacks, so nothing looks broken locally.
 *
 * What is not silent is the browser console on the deployed site, which fills
 * with one 404 per picture and reads like the app is failing. That happened,
 * and it was diagnosed as a bad picture source rather than as a mirror that had
 * never been filled — which is exactly the confusion a warning at build time
 * prevents.
 *
 * This does NOT fail the build. A picture-less build is a legitimate thing to
 * make; it just should not be a surprise.
 */

import { readdir, readFile } from 'node:fs/promises';

const SETS = [
  { dir: 'public/att', map: 'tools/att-sources.json', what: 'attachment pictures' },
  { dir: 'public/ammo', map: 'tools/ammo-sources.json', what: 'ammunition pictures' },
  { dir: 'public/gear', map: 'tools/gear-sources.json', what: 'reel-entry icons' },
];

const names = async (dir) =>
  (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4));
const wanted = async (map) => Object.keys(JSON.parse(await readFile(map, 'utf8').catch(() => '{}')));

/**
 * Some pictures are committed to the repo rather than downloaded — see
 * tools/gear-local.json. They are already in public/gear/, so counting them as
 * files present while they are absent from the sources list would make a full
 * mirror look like it had MORE than it wanted. Subtract them from both sides
 * and this counts downloads only.
 */
const local = new Set(
  JSON.parse(await readFile('tools/gear-local.json', 'utf8').catch(() => '{"ids":[]}')).ids,
);

const rows = [];
for (const set of SETS) {
  const have = (await names(set.dir)).filter((n) => !local.has(n)).length;
  const want = (await wanted(set.map)).filter((n) => !local.has(n)).length;
  rows.push({ ...set, have, want });
}

const short = rows.filter((r) => r.have < r.want);
if (short.length === 0) {
  console.log('pictures: all three mirrors filled');
} else {
  const empty = short.filter((r) => r.have === 0).length === short.length;
  console.warn('\n  ' + '-'.repeat(66));
  console.warn(`  PICTURES ARE ${empty ? 'MISSING' : 'INCOMPLETE'} — this build will show fallbacks, not artwork.`);
  for (const r of short) console.warn(`    ${r.dir.padEnd(12)} ${r.have}/${r.want} ${r.what}`);
  console.warn('');
  console.warn('  Fix:  npm run icons        (downloads them into public/)');
  console.warn('        git add public       (they must be committed to deploy)');
  console.warn('');
  console.warn('  Skipping this is fine locally. Deploying it means a 404 in the');
  console.warn('  console for every picture on the page.');
  console.warn('  ' + '-'.repeat(66) + '\n');
}
