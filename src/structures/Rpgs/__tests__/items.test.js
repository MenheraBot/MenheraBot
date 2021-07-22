const items = require('../items.json');
const mobs = require('../mobs.json');

it('should check if the items required by ferreiro exists', () => {
  const drops = Object.keys(mobs).reduce((p, v) => {
    const loots = mobs[v]
      .map((mob) => mob.loots)
      .flat()
      .map((loot) => loot?.name)
      .filter((loot) => loot);
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
