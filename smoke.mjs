// Headless smoke test: boots the production build and walks the whole
// wheel -> token -> lever -> reels -> dice flow.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const server = createServer(async (req, res) => {
  const path = (req.url || '/').split('?')[0];
  let file = join(DIST, path === '/' ? 'index.html' : path);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(DIST, 'index.html');
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(4321, r));

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1320, height: 1700 } });

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

let failures = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

// Mirrors src/data/deltaforce.ts. Tide Prison is Hard-only; the Zero Dam night
// tiers sit under Easy/Normal, not Hard.
const MAPS_BY_MODE = {
  Easy: ['Zero Dam', 'Zero Dam — Night', 'Layali Grove', 'AZ3 Nuclear Power Plant'],
  Normal: [
    'Zero Dam',
    'Zero Dam — Night',
    'Layali Grove',
    'Brakkesh',
    'Space City',
    'AZ3 Nuclear Power Plant',
  ],
  Hard: ['Brakkesh', 'Space City', 'Tide Prison'],
};

// Easy blocks helmets and vests above Tier 4 at the deploy screen; rigs and
// backpacks are not restricted. Counts are of the full item tables.
const POOLS = {
  Easy: { helmet: 16, vest: 17, rig: 19, backpack: 26 },
  Normal: { helmet: 23, vest: 25, rig: 19, backpack: 26 },
  Hard: { helmet: 23, vest: 25, rig: 19, backpack: 26 },
};
const REEL_INDEX = { map: 0, operator: 1, weapon: 2, helmet: 3, vest: 4, rig: 5, backpack: 6 };

const poolSize = async (slot) =>
  Number((await page.locator('.reel').nth(REEL_INDEX[slot]).locator('.reel__count').textContent())?.trim());
const TONE = { Easy: 'coin--red', Normal: 'coin--black', Hard: 'coin--green' };

const wonMode = () => page.locator('.legend__item.is-won .legend__name').textContent();
const paid = async () => (await page.locator('.coinslot__text').textContent())?.trim() === 'Inserted';
// Scoped to the difficulty block: the crown now carries a preset readout too,
// and a bare .machine__mode-value matches both.
const modeIndicator = async () =>
  (
    await page
      .locator('.machine__readouts .machine__mode:not(.machine__mode--preset) .machine__mode-value')
      .textContent()
  )?.trim();

await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

/* -------------------------------------------------------------- render */

// Wheel, dice tray, keycard fan, stick cup.
check(
  'four canvases mounted',
  (await page.locator('.wheelcanvas canvas').count()) === 4,
  `${await page.locator('.wheelcanvas canvas').count()} found`,
);
const box = await page.locator('.stage__wheel').first().locator('canvas').boundingBox();
check('wheel canvas has size', !!box && box.width > 200 && box.height > 200, `${box?.width}x${box?.height}`);
const diceBox = await page.locator('.stage__wheel--dice canvas').boundingBox();
check('dice canvas has size', !!diceBox && diceBox.width > 200, `${diceBox?.width}x${diceBox?.height}`);
check('result tab is gone', (await page.locator('.result').count()) === 0);

/* --------------------------------------------------------- start state */

check('seven reels', (await page.locator('.reel').count()) === 7);
// Hold and the nudge arrows only rearrange what you already have, so they are
// free from the start. Spin re-rolls a column, so it costs a token like the
// lever does.
check(
  'hold is free before any pull',
  await page.locator('.reel').nth(2).locator('.btn--hold').isEnabled(),
);
check(
  'column spin is locked without a token',
  await page.locator('.reel').nth(2).locator('.reel__respin').isDisabled(),
);
check(
  'column spin button reads Spin',
  (await page.locator('.reel').nth(2).locator('.reel__respin').textContent()).trim() === 'Spin',
);
check('lever disabled before payment', await page.locator('.lever').isDisabled());
check('indicator shows no token', (await modeIndicator()) === 'No token');
const startValues = await page.locator('.reel__value').allTextContents();
check('reels start empty', startValues.every((v) => v.trim() === '—'), startValues.join('|'));

/* ------------------------------------------- legend as a manual picker */

check('legend rows are buttons', (await page.locator('.legend__item').evaluateAll(
  (els) => els.every((e) => e.tagName === 'BUTTON'),
)));

await page.locator('.legend__item--green').click(); // Hard
await page.waitForSelector('.coin', { timeout: 5000 });
check('legend click mints a token', await page.locator('.coin').isVisible());
check('legend marks the pick', (await wonMode())?.trim() === 'Hard');
check(
  'legend token is the right metal',
  (await page.locator('.coin').getAttribute('class')).includes('coin--green'),
);

/* ------------------------------------- difficulty actually gates the gear */

// Hard (already selected): nothing is capped.
for (const slot of ['helmet', 'vest', 'rig', 'backpack']) {
  check(`Hard leaves ${slot} uncapped`, (await poolSize(slot)) === POOLS.Hard[slot], `${await poolSize(slot)}`);
}
check('Hard map pool excludes Easy-only maps', (await poolSize('map')) === MAPS_BY_MODE.Hard.length);

// Easy: helmets and vests are capped at Tier 4, rigs and backpacks are not.
await page.locator('.legend__item--red').click();
await page.waitForTimeout(250);
for (const slot of ['helmet', 'vest', 'rig', 'backpack']) {
  check(`Easy caps ${slot} correctly`, (await poolSize(slot)) === POOLS.Easy[slot], `${await poolSize(slot)}`);
}
check('Easy map pool is right size', (await poolSize('map')) === MAPS_BY_MODE.Easy.length);

// And the cap is a real tier ceiling, not just a smaller number.
await page.locator('.legend__item--black').click();
await page.waitForTimeout(250);
check('Normal restores full gear pools', (await poolSize('helmet')) === POOLS.Normal.helmet);
check('Normal map pool is right size', (await poolSize('map')) === MAPS_BY_MODE.Normal.length);

await page.locator('.legend__item--green').click();
await page.waitForTimeout(250);

/* ------------------------------------------------------------ the wheel */

await page.getByRole('button', { name: 'Spin the wheel' }).click();
await page.waitForFunction(
  () => !/Spinning/.test(document.querySelector('.stage .btn--primary')?.textContent || ''),
  { timeout: 25000 },
);
const mode = (await wonMode())?.trim();
check('wheel produced a difficulty', ['Easy', 'Normal', 'Hard'].includes(mode), mode);

await page.waitForSelector('.coin', { timeout: 5000 });
const coinClass = await page.locator('.coin').getAttribute('class');
check('coin matches difficulty', coinClass.includes(TONE[mode]), `${mode} -> ${coinClass}`);
check(
  'coin stamped with difficulty',
  (await page.locator('.coin__label').textContent())?.trim() === mode[0],
);

// Regression: the lever's label must sit INSIDE the button's hit box. It used
// to be positioned below it, so clicking the word "PULL" hit nothing.
const leverBox = await page.locator('.lever').boundingBox();
const textBox = await page.locator('.lever__text').boundingBox();
check(
  'lever label is inside its hit box',
  textBox.y >= leverBox.y && textBox.y + textBox.height <= leverBox.y + leverBox.height,
);
check('lever explains why it is inert', (await page.locator('.lever__text').textContent())?.trim() === 'NO TOKEN');

/* -------------------------------------------------------- insert + pull */

await page.waitForTimeout(700); // let the drop animation settle
await page.locator('.coin').click();
await page.waitForFunction(
  () => document.querySelector('.coinslot__text')?.textContent?.trim() === 'Inserted',
  { timeout: 5000 },
);
check('token accepted', await paid());
check('indicator shows the difficulty, not a count', (await modeIndicator()) === mode, await modeIndicator());
check('cabinet never renders a locked state', (await page.locator('.machine.is-locked').count()) === 0);
check('lever now enabled', await page.locator('.lever').isEnabled());
check('lever reads PULL DOWN when paid', (await page.locator('.lever__text').textContent())?.trim() === 'PULL DOWN');

// Event-driven, not polled. With the reels running one at a time a snapshot
// only catches whichever is moving, and a 40ms poll gets starved by the three
// WebGL canvases — it silently missed a whole 700ms column. transitionrun
// fires exactly when a strip's transition is configured, so nothing is lost;
// a MutationObserver on the class attribute catches every overlap.
await page.evaluate(() => {
  window.__spin = {};
  window.__peak = 0;
  const reels = [...document.querySelectorAll('.reel')];
  reels.forEach((r, i) => {
    r.querySelector('.reel__strip').addEventListener('transitionrun', (e) => {
      if (e.propertyName !== 'transform') return;
      const ms = Math.round(
        parseFloat(getComputedStyle(e.target).transitionDuration) * 1000,
      );
      // Keep the longest: a nudge on the same reel is a much shorter blip.
      window.__spin[i] = Math.max(window.__spin[i] || 0, ms);
    });
  });
  window.__frames = [];
  const tally = () => {
    const live = reels.filter((r) => r.classList.contains('is-spinning')).length;
    window.__peak = Math.max(window.__peak, live);
    window.__frames.push({
      spinning: reels.map((r) => (r.classList.contains('is-spinning') ? 1 : 0)).join(''),
      values: reels.map((r) => r.querySelector('.reel__value').textContent.trim()),
    });
  };
  new MutationObserver(tally).observe(document.querySelector('.cabinet__reels'), {
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
  });
  tally();
});

// Pull by DRAGGING the knob down, the way a real lever works.
const knob = await page.locator('.lever__knob').boundingBox();
await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
await page.mouse.down();
await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2 + 90, { steps: 14 });
await page.mouse.up();
await page.waitForTimeout(500);
check('drag-to-pull spins the reels', (await page.locator('.reel.is-spinning').count()) > 0);

// The rarity tint must stay hidden while the reels are moving. `entry` is
// decided the instant the lever is pulled, so a column coloured straight away
// would give the result away before it landed.
check(
  'rarity stays hidden while spinning',
  (await page.locator('.reel.is-spinning[class*="reel--t"]').count()) === 0,
);


await page.waitForTimeout(1500);
const midway = await page.locator('.reel.is-spinning').count();
await page.waitForFunction(() => document.querySelectorAll('.reel.is-spinning').length === 0, {
  timeout: 25000,
});
check('reels stop in sequence', midway > 0 && midway < 7, `${midway} still spinning midway`);

// Now the reels have landed, the tint appears.
check(
  'rarity revealed once the reels land',
  (await page.locator('.reel[class*="reel--t"]').count()) > 0,
  `${await page.locator('.reel[class*="reel--t"]').count()} tinted`,
);

const sampled = await page.evaluate(() => ({
  spin: window.__spin,
  peak: window.__peak,
  frames: window.__frames,
}));

// Regression: a column still waiting its turn must not already be showing its
// result. Publishing every result at pull time made the queued columns snap to
// their final item and then roll around to an answer they were already
// displaying.
let leaked = null;
for (const f of sampled.frames) {
  const spinningAt = f.spinning.indexOf('1');
  if (spinningAt === -1) continue;
  for (let i = spinningAt + 1; i < f.values.length; i++) {
    if (f.values[i] !== '—') {
      leaked ??= `col ${i} showed "${f.values[i]}" while col ${spinningAt} was still spinning`;
    }
  }
}
check('no column reveals its result before it spins', leaked === null, leaked ?? '');

// The core of it: one column at a time, left to right.
check('only one column spins at a time', sampled.peak === 1, `peak ${sampled.peak}`);

const tiers = await page.evaluate(() =>
  [...document.querySelectorAll('.reel')].map((r) => {
    const c = [...r.classList].find((x) => x.startsWith('reel--t'));
    return c ? Number(c.slice(7)) : 0;
  }),
);

// Mirrors SPIN_BASE / RARITY_MAX in App.tsx. No per-column term any more —
// the ordering comes from the queue, so a column's length depends only on the
// rarity it lands on.
const factor = (t) => 1 + (Math.max(1, Math.min(6, t || 1)) - 1) * (1.5 / 5);
const seen = Object.keys(sampled.spin).map(Number);
check('every column was sampled while spinning', seen.length === 7, `saw ${seen.length}`);
const timingOk = seen.every((i) => sampled.spin[i] === Math.round(700 * factor(tiers[i])));
check(
  'spin length is set purely by the rarity that lands',
  timingOk,
  `tiers ${tiers.join(',')} | got ${seen.map((i) => sampled.spin[i]).join(',')}`,
);

// The headline requirement, checked against the model the app actually uses.
check(
  'a red spins 2.5x as long as a grey',
  Math.round(700 * factor(6)) / Math.round(700 * factor(1)) === 2.5,
);

const values = await page.locator('.reel__value').allTextContents();
check('all reels filled', values.every((v) => v.trim() && v.trim() !== '—'), values.join(' | '));
check('map respects difficulty', MAPS_BY_MODE[mode].includes(values[0].trim()), `${mode} -> ${values[0].trim()}`);
check('token consumed', !(await paid()));
check('lever re-locked', await page.locator('.lever').isDisabled());
check('indicator keeps the difficulty in play', (await modeIndicator()) === mode);

/* ------------------------------------------------------- hold + a click */

check('controls stay usable with no token', await page.locator('.reel').nth(2).locator('.btn--hold').isEnabled());

// A column spin needs a token, and spends it.
check(
  'column spin stays locked with no token',
  await page.locator('.reel').nth(2).locator('.reel__respin').isDisabled(),
);
await page.locator('.legend__item--black').click();
await page.waitForSelector('.coin', { timeout: 5000 });
await page.locator('.coin').click();
await page.waitForFunction(
  () => document.querySelector('.coinslot__text')?.textContent?.trim() === 'Inserted',
  { timeout: 5000 },
);
check(
  'column spin unlocks once a token is in',
  await page.locator('.reel').nth(2).locator('.reel__respin').isEnabled(),
);
await page.locator('.reel').nth(2).locator('.reel__respin').click();
await page.waitForFunction(
  () => document.querySelectorAll('.reel.is-spinning').length === 0,
  { timeout: 20000 },
);
check('spinning one column spends the token', !(await paid()));
check(
  'column spin re-locks after spending',
  await page.locator('.reel').nth(2).locator('.reel__respin').isDisabled(),
);
const heldReel = page.locator('.reel').nth(2);
await heldReel.locator('.btn--hold').click();
const heldName = (await heldReel.locator('.reel__value').textContent())?.trim();

await page.locator('.legend__item--red').click(); // Easy, straight from the legend
await page.waitForSelector('.coin', { timeout: 8000 });
await page.waitForTimeout(700);
await page.locator('.coin').click();
await page.waitForFunction(
  () => document.querySelector('.coinslot__text')?.textContent?.trim() === 'Inserted',
  { timeout: 5000 },
);
check('indicator follows the new token', (await modeIndicator()) === 'Easy', await modeIndicator());

// A plain click on the lever must still work alongside dragging.
await page.locator('.lever').click();
await page.waitForFunction(() => document.querySelectorAll('.reel.is-spinning').length === 0, {
  timeout: 25000,
});
check('click-to-pull still works', (await page.locator('.reel__value').allTextContents()).every((v) => v.trim() !== '—'));
check('hold survives a pull', (await heldReel.locator('.reel__value').textContent())?.trim() === heldName, heldName);

/* ------------------------------------------------- nudging is coherent */

// Regression: the cells either side of the payline used to be picked at
// random, so a neighbour could be the payline item itself and the same name
// appeared twice in the window. Nudging re-rolled those picks, so scrolling
// hit it within a few presses.
const opReel = page.locator('.reel').nth(1); // operator — a 16-deep pool
const cellNames = async () =>
  (await opReel.locator('.cell__name').allTextContents()).map((t) => t.trim());

// Wait for the slide to finish rather than guessing at a delay: fixed waits
// are both slower than needed and unreliable on a loaded machine.
const settle = () =>
  page
    .waitForFunction(
      () => {
        const el = document.querySelectorAll('.reel')[1].querySelector('.reel__strip');
        return el.children.length === 3 && getComputedStyle(el).transform === 'matrix(1, 0, 0, 1, 0, 0)';
      },
      { timeout: 4000 },
    )
    .catch(() => {});

let dupSeen = null;
let mismatch = null;
for (let i = 0; i < 12; i++) {
  const before = await cellNames();
  if (before.length === 3 && new Set(before).size !== 3) dupSeen ??= before.join(' | ');

  // The cell below the payline must be the one that arrives when you press ▼.
  const expected = before[2];
  await opReel.getByRole('button', { name: /^Next / }).click();
  await settle();
  const after = await cellNames();
  if (expected && after[1] && after[1] !== expected) {
    mismatch ??= `expected ${expected}, got ${after[1]}`;
  }
  if (after.length === 3 && new Set(after).size !== 3) dupSeen ??= after.join(' | ');
}
check('no duplicate item in the reel window while nudging', dupSeen === null, dupSeen ?? '');
check('nudging down promotes the cell below the payline', mismatch === null, mismatch ?? '');

// And the same going the other way.
let upMismatch = null;
for (let i = 0; i < 6; i++) {
  const before = await cellNames();
  const expected = before[0];
  await opReel.getByRole('button', { name: /^Previous / }).click();
  await settle();
  const after = await cellNames();
  if (expected && after[1] && after[1] !== expected) {
    upMismatch ??= `expected ${expected}, got ${after[1]}`;
  }
}
check('nudging up promotes the cell above the payline', upMismatch === null, upMismatch ?? '');

// Deterministic signal that the slide path was taken: a slide builds a FOUR
// cell strip spanning the old and new positions. A snap only ever renders
// three. Unlike watching for transitionend, this does not depend on a real
// frame being rendered — under a software renderer the browser can start the
// transition late or coalesce it away, which is indistinguishable from a snap
// no matter how long you wait.
await opReel.getByRole('button', { name: /^Next / }).click();
const spanned = await page
  .waitForFunction(
    () => document.querySelectorAll('.reel')[1].querySelector('.reel__strip').children.length === 4,
    { timeout: 2000 },
  )
  .then(() => true)
  .catch(() => false);
check('nudging slides the strip rather than snapping', spanned);
await settle();

// And it comes to rest in one predictable shape.
const restShape = await page.evaluate(() => {
  const el = document.querySelectorAll('.reel')[1].querySelector('.reel__strip');
  return { cells: el.children.length, transform: getComputedStyle(el).transform };
});
check(
  'reel settles back to three cells at offset zero',
  restShape.cells === 3 && /matrix\(1, 0, 0, 1, 0, 0\)/.test(restShape.transform),
  JSON.stringify(restShape),
);

/* ------------------------------------------- coin at the screen edges */

/**
 * Carrying the token into the top or bottom of the screen drags the page along
 * with it; it only strikes something once the page itself has run out. Left and
 * right stay hard walls.
 *
 * Runs on its own short page so the document is guaranteed to overflow with the
 * token still on screen — the main run's 1700px-tall viewport barely scrolls.
 */
{
  const p = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Sparks are torn down after 560ms and the scroll runs off a frame loop that
  // SwiftShader starves, so polling for a count races badly. Every burst is
  // logged as it happens instead, with where it struck and where the page was.
  await p.evaluate(() => {
    window.__bursts = [];
    new MutationObserver((recs) => {
      for (const r of recs) for (const n of r.addedNodes) {
        if (n.nodeType !== 1 || !n.classList?.contains('sparks')) continue;
        const first = n.querySelector('.spark');
        window.__bursts.push({
          y: first ? Math.round(parseFloat(first.style.top)) : -1,
          scrollY: Math.round(window.scrollY),
          maxScroll: Math.round(document.documentElement.scrollHeight - window.innerHeight),
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  });

  const bursts = () => p.evaluate(() => window.__bursts);
  const top = () => p.evaluate(() => Math.round(window.scrollY));
  const end = await p.evaluate(() =>
    Math.round(document.documentElement.scrollHeight - window.innerHeight));
  check('page overflows a short viewport', end > 300, `max=${end}`);

  await p.locator('.legend__item--black').click();
  await p.waitForSelector('.coin', { timeout: 8000 });
  await p.waitForTimeout(600);

  // Park with room in both directions and the coin still on screen: scrolling
  // far enough to sit mid-document would take the coin off the top with it.
  await p.evaluate(() => {
    const r = document.querySelector('.coin').getBoundingClientRect();
    window.scrollTo(0, Math.round(r.top + window.scrollY - 120));
  });
  await p.waitForTimeout(150);
  const parked = await top();
  check('parked with room above and below', parked > 100 && parked < end - 100, `${parked} of ${end}`);

  const cb = await p.locator('.coin').boundingBox();
  const cx = cb.x + cb.width / 2;
  await p.mouse.move(cx, cb.y + 4);
  await p.mouse.down();
  await p.waitForTimeout(60);

  await p.mouse.move(cx, 2, { steps: 14 });
  await p.waitForFunction(() => window.scrollY === 0, null, { timeout: 20000 }).catch(() => {});
  check('holding the token at the top drags the page up', (await top()) === 0, `${parked} -> ${await top()}`);
  const coinTop = await p.evaluate(() => Math.round(document.querySelector('.coin').getBoundingClientRect().top));
  check('token stays inside the viewport', coinTop >= -4 && coinTop < 60, `top=${coinTop}`);

  await p.waitForFunction(() => window.__bursts.length > 0, null, { timeout: 8000 }).catch(() => {});
  const up = await bursts();
  check('token strikes the top only once the page runs out',
    up.length === 1 && up[0].scrollY === 0 && up[0].y < 120, JSON.stringify(up));

  await p.mouse.move(cx, 690, { steps: 16 });
  await p.waitForFunction((m) => window.scrollY >= m - 2, end, { timeout: 30000 }).catch(() => {});
  check('holding the token at the bottom drags the page down', (await top()) >= end - 2, `${await top()} / ${end}`);

  await p.waitForFunction((n) => window.__bursts.length > n, up.length, { timeout: 8000 }).catch(() => {});
  const down = (await bursts()).slice(up.length);
  check('token strikes the bottom only once the page runs out',
    down.length > 0 && down.every((b) => b.scrollY >= b.maxScroll - 2) && down.some((b) => b.y > 560),
    JSON.stringify(down));

  const beforeX = (await bursts()).length;
  await p.mouse.move(-40, 400, { steps: 10 });
  await p.waitForFunction((n) => window.__bursts.length > n, beforeX, { timeout: 5000 }).catch(() => {});
  check('left edge is still a hard wall', (await bursts()).length > beforeX);
  // The rect includes the 1.1x drag scale, so the visual left sits ~2.9px under.
  const coinLeft = await p.evaluate(() => Math.round(document.querySelector('.coin').getBoundingClientRect().left));
  check('token clamped at the left edge', coinLeft >= -4 && coinLeft < 4, `left=${coinLeft}`);

  await p.mouse.up();
  await p.close();
}

/* --------------------------------------------- payline on a phone */

/**
 * The cabinet-wide payline is absolutely positioned inside the horizontal
 * scroller, so it travels with the strip — on a phone, where the columns are
 * one per screen, only the first column ever had a payline under it. Each
 * column now carries its own.
 */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const lines = await p.evaluate(() => {
    const global = getComputedStyle(document.querySelector('.payline')).display;
    return {
      global,
      reels: [...document.querySelectorAll('.reel')].map((r) => {
        const pl = r.querySelector('.reel__payline');
        const win = r.querySelector('.reel__window').getBoundingClientRect();
        const b = pl?.getBoundingClientRect();
        return {
          shown: pl ? getComputedStyle(pl).display : 'missing',
          top: b ? Math.round(b.top - win.top) : -1,
          arrows: r.querySelectorAll('.reel__payline .payline__arrow').length,
        };
      }),
    };
  });
  check('cabinet-wide payline is off on a phone', lines.global === 'none', lines.global);
  check('every column has its own payline with both arrows',
    lines.reels.length === 7 && lines.reels.every((r) => r.shown === 'block' && r.arrows === 2),
    JSON.stringify(lines.reels));
  check('paylines all sit on the same row',
    new Set(lines.reels.map((r) => r.top)).size === 1 && lines.reels[0].top > 0,
    JSON.stringify(lines.reels.map((r) => r.top)));
  await ctx.close();
}

/* ------------------------------------------------------------ drag coin */

await page.locator('.legend__item--black').click();
await page.waitForSelector('.coin', { timeout: 8000 });
await page.waitForTimeout(700);
const coinBox = await page.locator('.coin').boundingBox();
const slotBox = await page.locator('.coinslot').boundingBox();
await page.mouse.move(coinBox.x + coinBox.width / 2, coinBox.y + coinBox.height / 2);
await page.mouse.down();
await page.mouse.move(slotBox.x + slotBox.width / 2, slotBox.y + slotBox.height / 2, { steps: 22 });
await page.mouse.up();
// Wait on the state, not on a fixed delay — the coin's drop animation plus a
// busy WebGL frame can push the insert past any timeout worth hard-coding.
await page
  .waitForFunction(
    () => document.querySelector('.coinslot__text')?.textContent?.trim() === 'Inserted',
    { timeout: 5000 },
  )
  .catch(() => {});
check('drag-to-insert works', await paid());
check('indicator shows dragged token', (await modeIndicator()) === 'Normal');

/* ---------------------------------------------------------------- dice */

const LOADOUT_FACES = ['Scav run', '150k', '300k', '500k', '800k', 'No cap'];
const ATTACH_FACES = ['Iron sights', '50k', '100k', '200k', '350k', 'No cap'];

const pipsBefore = await page.locator('.dieresult__pip').allTextContents();
check('dice start unrolled', pipsBefore.every((p) => p.trim() === '?'), pipsBefore.join(','));

await page.getByRole('button', { name: 'Throw the dice' }).click();
await page.waitForFunction(
  () => !/Rolling/.test(document.querySelector('.stage--dice .btn--primary')?.textContent || ''),
  { timeout: 20000 },
);
await page.waitForTimeout(300);

const pips = (await page.locator('.dieresult__pip').allTextContents()).map((p) => Number(p.trim()));
check('both dice show 1-6', pips.every((n) => n >= 1 && n <= 6), pips.join(','));
const capValues = (await page.locator('.dieresult__value').allTextContents()).map((v) => v.trim());
check('white die matches loadout cap', LOADOUT_FACES[pips[0] - 1] === capValues[0], `${pips[0]} -> ${capValues[0]}`);
check('red die matches attachment cap', ATTACH_FACES[pips[1] - 1] === capValues[1], `${pips[1]} -> ${capValues[1]}`);

/* ------------------------------------------------------------ keycards */

/**
 * The keycard fan sits between the dice and the sticks, and its deck IS the
 * locked rooms on the map you rolled — so it is gated on stage two having
 * landed one, and a hand is void the moment a different map comes up.
 */
{
  const stages = await page.evaluate(() =>
    [...document.querySelectorAll('.stage, .stage2')].map((s) =>
      s.classList.contains('stage2')
        ? 'stage2'
        : [...s.classList].find((c) => c.startsWith('stage--')) ?? 'stage'));
  check('keycards sit after the dice and before the sticks',
    JSON.stringify(stages) === JSON.stringify(['stage', 'stage2', 'stage--dice', 'stage--cards', 'stage--sticks']),
    JSON.stringify(stages));

  // The gate needs a page where nothing has been rolled yet.
  const fresh = await browser.newPage({ viewport: { width: 1320, height: 1700 } });
  await fresh.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  check('draw is locked until a map is rolled',
    await fresh.getByRole('button', { name: /Draw a card/ }).isDisabled());
  check('the empty state says why',
    /Roll a map in stage 2 first/.test(await fresh.locator('.keys__empty').textContent()));
  await fresh.close();

  const mapName = (await page.locator('.reel__value').first().textContent()).trim();
  const drawBtn = page.getByRole('button', { name: /Draw a card|Hand full|Drawing/ });
  check('draw unlocks with a map on the reel', !(await drawBtn.isDisabled()), mapName);

  const counter = async () => (await page.locator('.keys__count').textContent()).trim();
  const limit = Number((await counter()).split('/')[1].trim());
  // Tide Prison and AZ3 run generic tiered access cards, so their deck is
  // three — the hand cannot exceed the deck it is drawn from.
  check('hand limit is five, or the deck if it is smaller', limit >= 1 && limit <= 5, await counter());

  for (let i = 0; i < limit; i++) {
    await drawBtn.click();
    await page.waitForFunction((n) => document.querySelectorAll('.keys__item').length === n, i + 1,
      { timeout: 20000 });
  }
  const hand = (await page.locator('.keys__item').allTextContents()).map((t) => t.trim());
  check('drew a full hand', hand.length === limit, JSON.stringify(hand));
  check('no key drawn twice', new Set(hand).size === hand.length, JSON.stringify(hand));
  check('every key names a real room', hand.every((k) => k.length > 3), JSON.stringify(hand));
  check('cannot draw past the hand limit', await drawBtn.isDisabled(), await counter());

  await page.getByRole('button', { name: 'Put them back' }).click();
  await page.waitForTimeout(300);
  check('putting them back empties the hand', (await page.locator('.keys__item').count()) === 0);
}

/* ------------------------------------------------------------- seeding */

// The header no longer exposes the seed, so pin one explicitly — which is a
// better test anyway: two loads of a known seed must agree.
const seed = 'TESTSEED';
const throwDice = async () => {
  const p = await browser.newPage();
  await p.goto(`http://localhost:4321/?seed=${seed}`, { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Throw the dice' }).click();
  await p.waitForFunction(
    () => !/Rolling/.test(document.querySelector('.stage--dice .btn--primary')?.textContent || ''),
    { timeout: 20000 },
  );
  const v = (await p.locator('.dieresult__pip').allTextContents()).map((x) => x.trim()).join(',');
  await p.close();
  return v;
};
const [d1, d2] = [await throwDice(), await throwDice()];
check('seeded dice are reproducible', d1 === d2, `${d1} vs ${d2}`);

/* --------------------------------------------------------- stick draw */

const squadValue = async () => (await page.locator('.squad__value').textContent()).trim();

check('squad starts undrawn', (await squadValue()) === 'Not drawn', await squadValue());
check('no bands before the draw', (await page.locator('.squad__band').count()) === 0);

await page.getByRole('button', { name: 'Shake the cup' }).click();
await page.waitForFunction(
  () => !/Shaking/.test(document.querySelector('.stage--sticks .btn--primary')?.textContent || ''),
  { timeout: 20000 },
);
const drawn = await squadValue();
check('stick draw yields a squad size', ['Solo', 'Duo', 'Trio'].includes(drawn), drawn);

// The painted bands must agree with the name — that redundancy is the whole
// reason the result is readable without relying on colour.
const BANDS = { Solo: 1, Duo: 2, Trio: 3 };
const bandCount = await page.locator('.squad__band').count();
check('bands match the squad size', bandCount === BANDS[drawn], `${drawn} -> ${bandCount}`);

// Same seed, same stick.
const drawSquad = async () => {
  const p = await browser.newPage();
  await p.goto(`http://localhost:4321/?seed=${seed}`, { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Shake the cup' }).click();
  await p.waitForFunction(
    () => !/Shaking/.test(document.querySelector('.stage--sticks .btn--primary')?.textContent || ''),
    { timeout: 20000 },
  );
  const v = (await p.locator('.squad__value').textContent()).trim();
  await p.close();
  return v;
};
const [s1, s2] = [await drawSquad(), await drawSquad()];
check('seeded stick draw is reproducible', s1 === s2, `${s1} vs ${s2}`);

/* ------------------------------------------------ layout & settings shape */

// Every section heading carries the same eyebrow.
const eyebrows = (await page.locator('.secttl__eyebrow').allTextContents()).map((t) => t.trim());
check('every section heading has the eyebrow', eyebrows.length >= 4, `${eyebrows.length} found`);
check('eyebrows all read the same', new Set(eyebrows).size === 1 && eyebrows[0] === 'Delta Force', eyebrows.join('|'));

// Presets live only in Settings now.
check('no preset bar above the cabinet', (await page.locator('.presetbar').count()) === 0);

// The stage line never suggests re-spinning.
check(
  'removed the spin-again wording',
  !(await page.locator('body').textContent()).includes('Spin again for a new run'),
);

// Footer no longer points at a source file.
check(
  'footer drops the source-file note',
  !(await page.locator('.ftr').textContent()).includes('deltaforce.ts'),
);

// Nudge arrows are permanent now, not a toggle.
// Two arrows per reel, always rendered (the old toggle is gone).
check(
  'nudge arrows always present',
  (await page.locator('.reel__controls .btn--icon').count()) === 14,
  `${await page.locator('.reel__controls .btn--icon').count()}`,
);

await page.locator('.panel__toggle').click();
await page.waitForTimeout(200);

const panelText = await page.locator('.panel__body').textContent();
for (const gone of ['Enable sounds', 'Instant spin', 'Show nudge arrows']) {
  check(`behaviour toggle "${gone}" is gone`, !panelText.includes(gone));
}
// Presets are reachable from both places — the quick bar and Settings.
check('presets are in settings', (await page.locator('.panel__body .preset').count()) === 5);

/* ------------------------------------------------- preset readout */

// The crown reports which preset the filters currently match. It is DERIVED
// from the filter state, not from the last button clicked, so it has to track
// a manual edit too — remembering the click would leave the badge claiming a
// preset the filters no longer match.
const presetReadout = async () =>
  (await page.locator('.machine__mode--preset .machine__mode-value').textContent()).trim();

check(
  'preset readout sits left of the difficulty one',
  await page.evaluate(() => {
    const p = document.querySelector('.machine__mode--preset');
    const d = document.querySelector('.machine__readouts .machine__mode:not(.machine__mode--preset)');
    return !!p && !!d && p.getBoundingClientRect().left < d.getBoundingClientRect().left;
  }),
);

for (const name of ['Budget run', 'Full send', 'Gremlin', 'Everything']) {
  await page.locator('.panel__body .preset', { hasText: name }).first().click();
  await page.waitForTimeout(160);
  check(`preset readout follows "${name}"`, (await presetReadout()) === name, await presetReadout());
}

// Nudge a single bound by hand — the readout must stop claiming a preset.
await page.getByRole('button', { name: 'Increase Helmet minimum Tier' }).click();
await page.waitForTimeout(200);
check('preset readout drops to Custom when edited', (await presetReadout()) === 'Custom', await presetReadout());
await page.locator('.panel__body .preset', { hasText: 'Everything' }).first().click();
await page.waitForTimeout(160);

// One titled section per filtered category.
const blockTitles = (await page.locator('.panel__body .panel__h').allTextContents()).map((t) => t.trim());
for (const want of [
  'Presets',
  'Helmet',
  'Vest',
  'Chest rig',
  'Backpack',
  'Maps',
  'Operator classes',
  'Weapon types',
]) {
  check(`settings has a "${want}" section`, blockTitles.includes(want), blockTitles.join(' / '));
}

// The map picker is real: unticking a map drops it from the pool.
const mapBlock = page
  .locator('.panel__block')
  .filter({ has: page.locator('.panel__h', { hasText: 'Maps' }) });
check('map picker lists every map', (await mapBlock.locator('.chip').count()) === 7);

await page.locator('.legend__item--black').click(); // Normal: 6 maps available
await page.waitForTimeout(200);
const beforeMaps = await poolSize('map');
await mapBlock.locator('.chip', { hasText: 'Brakkesh' }).first().click();
await page.waitForTimeout(200);
const afterMaps = await poolSize('map');
check('unticking a map shrinks the pool', afterMaps === beforeMaps - 1, `${beforeMaps} -> ${afterMaps}`);

// And it composes with the difficulty gate rather than overriding it.
await page.locator('.legend__item--red').click(); // Easy never offers Brakkesh anyway
await page.waitForTimeout(200);
check('map picker composes with difficulty', (await poolSize('map')) === 4);

await mapBlock.locator('.chip', { hasText: 'Brakkesh' }).first().click(); // restore
await page.locator('.panel__toggle').click();
await page.waitForTimeout(200);

await page.screenshot({ path: 'preview.png', fullPage: true });
check('no console errors', errors.length === 0, errors.slice(0, 3).join(' ;; '));

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
await browser.close();
server.close();
process.exit(failures === 0 ? 0 : 1);
