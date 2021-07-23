import { IDungeonMob, IMobLoot } from '@utils/Types';
import items from '../items.json';
import mobs from '../mobs.json';

it('should check if the items required by ferreiro exists', () => {
  const drops = Object.keys(mobs).reduce((p, v) => {
    const loots = mobs[v]
      .map((mob: IDungeonMob) => mob.loots)
      .flat()
      .map((loot: IMobLoot) => loot?.name)
      .filter((loot: IMobLoot) => loot);
    return p.concat(loots);
  }, []);

  const nonexistentItems = items.ferreiro.reduce((p, equip) => {
    const itemsNotFound = Object.keys(equip?.required_items ?? {}).filter(
      (item) => !drops.includes(item),
    );
    return p.concat(itemsNotFound);
  }, []);

  expect(nonexistentItems).toEqual([]);
});
