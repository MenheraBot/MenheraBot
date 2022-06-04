import { ItemsFile } from '@roleplay/Types';

const Items: { [id: number]: ItemsFile } = {
  100: {
    type: 'backpack',
    availableLocations: [0],
    levels: {
      1: {
        cost: 0,
        items: [],
        value: 10,
      },
      2: {
        cost: 60,
        items: [],
        value: 15,
      },
    },
  },
  101: {
    type: 'protection',
    availableLocations: [0],
    levels: {
      1: {
        cost: 0,
        items: [],
        value: 10,
      },
      2: {
        cost: 60,
        items: [],
        value: 15,
      },
    },
  },
  102: {
    type: 'weapon',
    availableLocations: [0],
    levels: {
      1: {
        cost: 0,
        items: [],
        value: 10,
      },
      2: {
        cost: 60,
        items: [],
        value: 20,
      },
    },
  },
  1: {
    type: 'enemy_drop',
    marketValue: 1,
  },
  2: {
    type: 'enemy_drop',
    marketValue: 1,
  },
  3: {
    type: 'enemy_drop',
    marketValue: 2,
  },
  4: {
    type: 'enemy_drop',
    marketValue: 6,
  },
  5: {
    type: 'enemy_drop',
    marketValue: 9,
  },
  6: {
    type: 'enemy_drop',
    marketValue: 11,
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
  103: {
    type: 'backpack',
    availableLocations: [0],
    levels: {
      1: {
        cost: 100,
        items: [4, 4, 4, 1, 1, 1],
        value: 20,
      },
      2: {
        cost: 60,
        items: [4, 4, 1],
        value: 30,
      },
    },
  },
};

export default Items;
