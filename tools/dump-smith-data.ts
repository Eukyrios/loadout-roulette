/**
 * Dump the data weapon-smith needs but does not own.
 *
 * Attachments and slot rules moved to weapon-smith and are authored there. What
 * is still authored here is the weapon roster — it drives this app's reels —
 * and the ammunition table. Both are dumped for the sibling to copy in.
 *
 * Run by weapon-smith's `npm run sync`, not by anything here.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { WEAPONS } from '../src/data/deltaforce';
import { AMMO, WEAPON_CALIBER } from '../src/data/ammo';

mkdirSync('tools/.smith', { recursive: true });
const put = (name: string, v: unknown) =>
  writeFileSync(`tools/.smith/${name}.json`, JSON.stringify(v));

put('weapons', WEAPONS.map((w) => ({
  id: w.id,
  name: w.name,
  cls: String(w.attrs?.class ?? ''),
  caliber: WEAPON_CALIBER[w.id] ?? null,
})));
put('ammo', AMMO);
console.log('dumped tools/.smith/');
