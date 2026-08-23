/**
 * Pulls current auction-house prices and writes public/prices.json.
 *
 * Run by .github/workflows/prices.yml on a schedule. The app then fetches its
 * own static prices.json — same origin, so no CORS, and no server to run.
 * Fetching the source straight from the browser is not an option: it
 * serves HTML rather than JSON and sends no CORS headers, so a page on
 * github.io cannot read it.
 *
 * Only the CURRENT price is kept. The table also carries 1D/7D/30D columns;
 * they are parsed past, not stored.
 *
 * Deliberately dependency-free — no npm install in CI, nothing to keep patched.
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname } from 'node:path';

const BASE = 'https://deltaforcetools.gg/auction-house';
const OUT = 'public/prices.json';
/** Pages are 20 rows; the whole catalogue is ~50. This is a runaway stop. */
const MAX_PAGES = 80;
/** Well under the real count — a scrape returning less than this is a failure,
 *  not a market with fewer items in it. */
const MIN_ITEMS = 300;
/** Courtesy gap between requests. This runs unattended; do not hammer them. */
const DELAY_MS = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Tags out, entities decoded, whitespace collapsed. */
const text = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/** Every table row on the page, as arrays of cell text. */
function rows(html) {
  const out = [];
  for (const tr of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => text(c[1]));
    if (cells.length >= 3) out.push(cells);
  }
  return out;
}

const CATEGORY = /^(firearms|ammo|gear|keycards?|consumables|collectibles|all)$/i;
const NUMBER = /^\d[\d,]*(\.\d+)?$/;

/**
 * Name and current price out of one row.
 *
 * Found by shape rather than by column index: the name is the first cell with
 * letters in it that is not the category tag, and the current price is the
 * first number after it — the 1D/7D/30D columns all sit further right. A
 * column being inserted upstream therefore does not silently shift the price.
 */
function parseRow(cells) {
  const n = cells.findIndex((c) => /[a-z]/i.test(c) && !CATEGORY.test(c) && c.length > 1);
  if (n < 0) return null;
  const priceCell = cells.slice(n + 1).find((c) => NUMBER.test(c));
  if (!priceCell) return null;
  const price = Math.round(Number(priceCell.replace(/,/g, '')));
  if (!Number.isFinite(price) || price <= 0) return null;
  return { name: cells[n], price };
}

async function page(n) {
  const url = n === 1 ? BASE : `${BASE}?page=${n}`;
  const res = await fetch(url, {
    headers: {
      // Named honestly, with somewhere to complain to.
      'user-agent': 'loadout-roulette price sync (+https://github.com/eukyrios/loadout-roulette)',
      accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

const prices = {};
let firstOfPrevious = null;

for (let n = 1; n <= MAX_PAGES; n++) {
  let html;
  try {
    html = await page(n);
  } catch (err) {
    // A single bad page late in the walk should not throw away everything
    // already collected; the MIN_ITEMS check below is the real gate.
    console.warn(`page ${n}: ${err.message}`);
    break;
  }

  const parsed = rows(html).map(parseRow).filter(Boolean);
  if (parsed.length === 0) {
    console.log(`page ${n}: empty — end of list`);
    break;
  }

  // Some listings on this site serve page 1's content for an out-of-range
  // page instead of an empty one, which would otherwise loop to MAX_PAGES.
  if (firstOfPrevious && parsed[0].name === firstOfPrevious) {
    console.log(`page ${n}: repeats the previous page — end of list`);
    break;
  }
  firstOfPrevious = parsed[0].name;

  for (const { name, price } of parsed) prices[name] = price;
  console.log(`page ${n}: ${parsed.length} rows (${Object.keys(prices).length} total)`);
  await sleep(DELAY_MS);
}

const count = Object.keys(prices).length;
if (count < MIN_ITEMS) {
  // Loud failure. Committing a near-empty file would quietly wipe every price
  // in the app the next time it deployed.
  console.error(`Only ${count} items scraped, expected at least ${MIN_ITEMS}. Markup changed?`);
  process.exit(1);
}

// Leave the file alone when nothing moved, so the workflow has nothing to
// commit and the history does not fill with no-op updates.
let previous = null;
try {
  await access(OUT);
  previous = JSON.parse(await readFile(OUT, 'utf8'));
} catch {
  /* first run */
}
if (previous && JSON.stringify(previous.prices) === JSON.stringify(prices)) {
  console.log(`${count} items, all unchanged — leaving ${OUT} as it is`);
  process.exit(0);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  `${JSON.stringify(
    {
      updated: new Date().toISOString(),
      source: BASE,
      note: 'Current auction-house price per item. Live market data — it moves.',
      count,
      prices,
    },
    null,
    1,
  )}\n`,
);
console.log(`wrote ${OUT} — ${count} items`);
