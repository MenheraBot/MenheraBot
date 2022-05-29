import { ItemsFile } from '@roleplay/Types';

const Items: { [id: number]: ItemsFile } = {
  100: {
    type: 'backpack',
    capacity: 5,
    perLevel: 5,
    toUpgrade: {
      cost: 30,
      costPerLevel: 60,
      boostPerUpgrade: 5,
    },
  },
  101: {
    type: 'protection',
    armor: 10,
    perLevel: 5,
    toUpgrade: {
      cost: 30,
      costPerLevel: 60,
      boostPerUpgrade: 4,
    },
  },
  102: {
    type: 'weapon',
    damage: 10,
    perLevel: 10,
    toUpgrade: {
      cost: 30,
      costPerLevel: 60,
      boostPerUpgrade: 7,
    },
  },
  1: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 2,
  },
  2: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 3,
  },
  3: {
    type: 'enemy_drop',
    marketValue: 2,
    perLevel: 4,
  },
  4: {
    type: 'enemy_drop',
    marketValue: 6,
    perLevel: 3,
  },
  5: {
    type: 'enemy_drop',
    marketValue: 9,
    perLevel: 6,
  },
  6: {
    type: 'enemy_drop',
    marketValue: 11,
    perLevel: 5,
  },
  7: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 40,
    boostType: 'life',
    perLevel: 20,
  },
  8: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 30,
    boostType: 'mana',
    perLevel: 20,
  },
};

export default Items;
