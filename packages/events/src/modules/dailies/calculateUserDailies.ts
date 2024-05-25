import { randomFromArray } from '../../utils/miscUtils';
import { DAILIES_AMOUNT, getAllDailies, getDailyById } from './dailies';
import { DatabaseDaily } from './types';

const calculateUserDailies = (): DatabaseDaily[] => {
  const newDailies: DatabaseDaily[] = [];

  while (newDailies.length < DAILIES_AMOUNT) {
    const randomDaily = randomFromArray(getAllDailies());

    if (!newDailies.some((d) => getDailyById(d.id).type === randomDaily.data.type)) {
      const randomAmount = Math.floor(
        Math.random() * (randomDaily.data.amountLimits[1] - randomDaily.data.amountLimits[0]) +
          randomDaily.data.amountLimits[0],
      );

      newDailies.push({ id: randomDaily.id, has: 0, need: randomAmount, redeemed: false });
    }
  }

  return newDailies;
};

export { calculateUserDailies };
