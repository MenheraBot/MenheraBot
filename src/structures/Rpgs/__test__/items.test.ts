import items from '../items';
import mobs from '../mobs';

it('should check if the items required by ferreiro exists', () => {
  const drops = Object.keys(mobs).reduce<string[]>((p, v) => {
    const loots = mobs[v as keyof typeof mobs]
      .map((mob) => mob.loots)
      .flat()
      .map((loot) => loot.name)
      .filter((loot) => loot);
    return p.concat(loots);
  }, []);

  const nonexistentItems = items.ferreiro.reduce<string[]>((p, equip) => {
    const ItemNames = Object.keys(equip?.required_items ?? {});
    const itemsNotFound = ItemNames.filter((item) => !drops.includes(item));
    return p.concat(itemsNotFound);
  }, []);

  expect(nonexistentItems).toEqual([]);
});
