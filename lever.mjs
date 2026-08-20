import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1320, height: 1500 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: '+e));
page.on('console', m => m.type()==='error' && errs.push('CONSOLE: '+m.text()));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

await page.getByRole('button', { name: 'Spin the wheel' }).click();
await page.waitForSelector('.result.is-set', { timeout: 25000 });
await page.waitForSelector('.coin', { timeout: 8000 });
await page.waitForTimeout(700);
await page.locator('.coin').click();
await page.waitForTimeout(800);
console.log('credits after insert:', (await page.locator('.machine__credits-value').textContent())?.trim());
console.log('lever disabled?', await page.locator('.lever').isDisabled());

// Click the KNOB specifically, like a human would.
const knob = await page.locator('.lever__knob').boundingBox();
const btn  = await page.locator('.lever').boundingBox();
const txt  = await page.locator('.lever__text').boundingBox();
console.log('button box:', JSON.stringify(btn));
console.log('knob box  :', JSON.stringify(knob));
console.log('text box  :', JSON.stringify(txt));
console.log('text inside button?', txt.y >= btn.y && txt.y + txt.height <= btn.y + btn.height);

// what element is actually at the knob centre / text centre?
for (const [name, b] of [['knob', knob], ['text', txt]]) {
  const el = await page.evaluate(([x,y]) => {
    const e = document.elementFromPoint(x,y);
    return e ? e.className + ' <' + e.tagName + '>' : 'NOTHING';
  }, [b.x + b.width/2, b.y + b.height/2]);
  console.log(`element at ${name} centre:`, el);
}

await page.mouse.click(knob.x + knob.width/2, knob.y + knob.height/2);
await page.waitForTimeout(900);
console.log('spinning reels after knob click:', await page.locator('.reel.is-spinning').count());
await page.waitForTimeout(4500);
const vals = await page.locator('.reel__value').allTextContents();
console.log('values:', vals.map(v=>v.trim()).join(' | '));
console.log('errors:', errs.length ? errs.slice(0,5) : 'none');
await browser.close();
