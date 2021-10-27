import { HuntingTypes, TMagicItemsFile } from '@utils/Types';

const MagicItems: { [id: number]: TMagicItemsFile<HuntingTypes> } = {
  1: {
    type: 'PROBABILITY_BOOST',
    huntType: 'demon',
    probabilities: [
      { amount: 1, probabilty: 20 },
      { amount: 2, probabilty: 20 },
      { amount: 3, probabilty: 30 },
      { amount: 4, probabilty: 15 },
      { amount: 5, probabilty: 8 },
      { amount: 6, probabilty: 5 },
      { amount: 0, probabilty: 2 },
    ],
    cost: 800000,
  },
};

export default MagicItems;
