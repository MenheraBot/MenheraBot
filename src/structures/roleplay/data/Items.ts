import { IItemFile } from '@roleplay/Types';

const items: { [key: number]: IItemFile<boolean> } = {
  0: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 1,
    },
    type: 'armor',
    rarity: 'common',
  },
  1: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'rare',
    type: 'armor',
  },

  2: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'epic',
    type: 'armor',
  },
  3: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'common',
    type: 'armor',
  },
  4: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'common',
    type: 'weapon',
  },

  5: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'rare',
    type: 'weapon',
  },

  6: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'epic',
    type: 'weapon',
  },

  7: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'common',
    type: 'potion',
  },

  8: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'rare',
    type: 'potion',
  },

  9: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 3,
    },
    rarity: 'epic',
    type: 'potion',
  },
};

export default items;
