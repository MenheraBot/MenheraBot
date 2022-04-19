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
    flags: ['upgradable'],
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
    flags: ['upgradable'],
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
    flags: ['upgradable'],
  },
  1: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 2,
    flags: ['droppable', 'sellable'],
  },
  2: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 3,
    flags: ['droppable', 'sellable'],
  },
  3: {
    type: 'enemy_drop',
    marketValue: 2,
    perLevel: 4,
    flags: ['droppable', 'sellable'],
  },
  4: {
    type: 'enemy_drop',
    marketValue: 6,
    perLevel: 3,
    flags: ['droppable', 'sellable'],
  },
  5: {
    type: 'enemy_drop',
    marketValue: 9,
    perLevel: 6,
    flags: ['droppable', 'sellable'],
  },
  6: {
    type: 'enemy_drop',
    marketValue: 11,
    perLevel: 5,
    flags: ['droppable', 'sellable'],
  },
  7: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 40,
    boostType: 'life',
    perLevel: 20,
    flags: ['buyable', 'consumable'],
  },
  8: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 30,
    boostType: 'mana',
    perLevel: 20,
    flags: ['buyable', 'consumable'],
  },
};

export default Items;
