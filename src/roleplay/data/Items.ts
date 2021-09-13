import { IItemFile } from 'roleplay/Types';

const items: { [key: number]: IItemFile<boolean> } = {
  0: {
    price: {
      gold: 0,
      silver: 0,
      bronze: 0,
    },
    data: {
      value: 4,
      perLevel: 1,
    },
    type: 'backpack',
    rarity: 'common',
  },
};

export default items;
