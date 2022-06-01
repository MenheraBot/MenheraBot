import { ItemsFile } from '@roleplay/Types';

const Items: { [id: number]: ItemsFile } = {
  100: {
    type: 'backpack',
    capacity: 10,
    perLevel: 5,
    toCraft: {
      cost: 0,
      items: [],
    },
    toUpgrade: {
      1: {
        cost: 60,
        items: [],
      },
    },
  },
  101: {
    type: 'protection',
    armor: 10,
    perLevel: 5,
    toCraft: {
      cost: 0,
      items: [],
    },
    toUpgrade: {
      1: {
        cost: 60,
        items: [],
      },
    },
  },
  102: {
    type: 'weapon',
    damage: 10,
    perLevel: 10,
    toCraft: {
      cost: 0,
      items: [],
    },
    toUpgrade: {
      1: {
        cost: 60,
        items: [],
      },
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
  103: {
    type: 'backpack',
    capacity: 20,
    perLevel: 10,
    toCraft: {
      cost: 100,
      items: [4, 4, 4, 1, 1, 1],
    },
    toUpgrade: {
      1: {
        cost: 60,
        items: [4, 4, 1],
      },
    },
  },
};

export default Items;
