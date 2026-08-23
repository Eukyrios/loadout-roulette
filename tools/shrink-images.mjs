/**
 * Cuts the mirrored pictures down to the size they are actually drawn at.
 *
 * WHY
 *
 * The upstream art is press-kit sized: the M4A1 render is 2000x1000 and 846 KB,
 * the P90 is 1.6 MB. A reel cell draws it at about 120x60. Twenty-odd of those
 * on screen at once is ten to twenty megabytes to show a row of thumbnails, and
 * on anything slower than a desk the cells stay empty long enough to look
 * broken — which is exactly how this was first reported.
 *
 * So the mirror keeps downloading the original, and this pass shrinks whatever
 * is oversized, in place. Idempotent: anything already within bounds is left
 * alone, so re-running is cheap and `npm run icons` chains straight into it.
 *
 *   npm run shrink
 *
 * BOUNDS are the largest the app ever draws each set, times two for a retina
 * screen, rounded up. Going smaller than this shows; going larger is bytes
 * nobody sees.
 */

import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('! sharp is not installed. Run: npm install');
  process.exit(1);
}

const SETS = [
  // Reel cells: 120x66 at most, so 320 covers 2x with room to spare.
  { dir: 'public/gear', max: 320 },
  // Capsule cards: the art plate is 252 texture pixels wide.
  { dir: 'public/att', max: 512 },
  // The round beside the wheel, and the wedge textures.
  { dir: 'public/ammo', max: 512 },
];

let touched = 0;
let saved = 0;

for (const set of SETS) {
  const files = (await readdir(set.dir).catch(() => [])).filter((f) => f.endsWith('.png'));
  if (files.length === 0) {
    console.log(`${set.dir}: nothing to do`);
    continue;
  }

  let n = 0;
  let before = 0;
  let after = 0;

  for (const f of files) {
    const p = path.join(set.dir, f);
    const img = sharp(p);
    const meta = await img.metadata().catch(() => null);
    if (!meta) continue;
    if (meta.width <= set.max && meta.height <= set.max) continue;

    const was = (await stat(p)).size;
    // Into a buffer first: sharp cannot write to the file it is reading.
    const buf = await img
      .resize({ width: set.max, height: set.max, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await sharp(buf).toFile(p);

    n++;
    before += was;
    after += buf.length;
  }

  console.log(
    `${set.dir}: shrank ${n}/${files.length}` +
      (n ? ` — ${Math.round(before / 1024)} KB into ${Math.round(after / 1024)} KB` : ''),
  );
  touched += n;
  saved += before - after;
}

if (touched) console.log(`\nSaved ${(saved / 1024 / 1024).toFixed(1)} MB across ${touched} files.`);
else console.log('\nEverything already within bounds.');
