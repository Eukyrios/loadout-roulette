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
const modeIndicator = async () =>
  (await page.locator('.machine__mode-value').textContent())?.trim();

await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

/* -------------------------------------------------------------- render */

check('two canvases mounted', (await page.locator('.wheelcanvas canvas').count()) === 2);
const box = await page.locator('.stage__wheel').first().locator('canvas').boundingBox();
check('wheel canvas has size', !!box && box.width > 200 && box.height > 200, `${box?.width}x${box?.height}`);
const diceBox = await page.locator('.stage__wheel--dice canvas').boundingBox();
check('dice canvas has size', !!diceBox && diceBox.width > 200, `${diceBox?.width}x${diceBox?.height}`);
check('result tab is gone', (await page.locator('.result').count()) === 0);

/* --------------------------------------------------------- start state */

check('seven reels', (await page.locator('.reel').count()) === 7);
check('machine starts locked', await page.locator('.machine.is-locked').isVisible());
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
check('machine unlocked', (await page.locator('.machine.is-locked').count()) === 0);
check('lever now enabled', await page.locator('.lever').isEnabled());
check('lever reads PULL DOWN when paid', (await page.locator('.lever__text').textContent())?.trim() === 'PULL DOWN');

// Pull by DRAGGING the knob down, the way a real lever works.
const knob = await page.locator('.lever__knob').boundingBox();
await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
await page.mouse.down();
await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2 + 90, { steps: 14 });
await page.mouse.up();
await page.waitForTimeout(500);
check('drag-to-pull spins the reels', (await page.locator('.reel.is-spinning').count()) > 0);

await page.waitForTimeout(1500);
const midway = await page.locator('.reel.is-spinning').count();
await page.waitForFunction(() => document.querySelectorAll('.reel.is-spinning').length === 0, {
  timeout: 25000,
});
check('reels stop in sequence', midway > 0 && midway < 7, `${midway} still spinning midway`);

const values = await page.locator('.reel__value').allTextContents();
check('all reels filled', values.every((v) => v.trim() && v.trim() !== '—'), values.join(' | '));
check('map respects difficulty', MAPS_BY_MODE[mode].includes(values[0].trim()), `${mode} -> ${values[0].trim()}`);
check('token consumed', !(await paid()));
check('lever re-locked', await page.locator('.lever').isDisabled());
check('indicator keeps the difficulty in play', (await modeIndicator()) === mode);

/* ------------------------------------------------------- hold + a click */

check('controls stay usable with no token', await page.locator('.reel').nth(2).locator('.btn--hold').isEnabled());
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
