import { randomFromArray } from '../../utils/miscUtils';
import {
  DAILIES_AMOUNT,
  HUNT_AMOUNT,
  PLANT_AMOUNT,
  ROLLS_COUNT,
  SEED_AMOUNT,
  STARS_PRIZE,
  getAllDailies,
  getRandomAward,
} from './dailies';
import { Award, DatabaseDaily } from './types';

const getDailyAwardOptions = (): [
  Award<string | number>,
  Award<string | number>,
  Award<string | number>,
] => {
  const awards = [getRandomAward(), getRandomAward(), getRandomAward()];

  const parsed = awards.map<Award<string | number>>((type) => {
    switch (type) {
      case 'estrelinhas':
        return { type, value: STARS_PRIZE };
      case 'roll':
        return { type, value: ROLLS_COUNT };
      case 'seed': {
        const randomSeed = Math.floor(Math.random() * 25);
        return { type, value: SEED_AMOUNT, helper: randomSeed };
      }
      case 'plant': {
        const randomPlant = Math.floor(Math.random() * 25);
        return { type, value: PLANT_AMOUNT, helper: randomPlant };
      }
      case 'hunt': {
        const huntType = randomFromArray([
          'demons' as const,
          'giants' as const,
          'angels' as const,
          'archangels' as const,
          'demigods' as const,
          'gods' as const,
        ]);

        return { type, value: huntType === 'gods' ? 1 : HUNT_AMOUNT, helper: huntType };
      }
      default:
        return { type, value: STARS_PRIZE };
    }
  });

  return parsed as [Award<string | number>, Award<string | number>, Award<string | number>];
};

const calculateUserDailies = (): DatabaseDaily[] => {
  const newDailies: DatabaseDaily[] = [];

  while (newDailies.length < DAILIES_AMOUNT) {
    const randomDaily = randomFromArray(getAllDailies());

    if (!newDailies.some((d) => d.id === randomDaily.id)) {
      const randomAmount = Math.floor(
        Math.random() * (randomDaily.data.amountLimits[1] - randomDaily.data.amountLimits[0]) +
          randomDaily.data.amountLimits[0],
      );

      newDailies.push({
        id: randomDaily.id,
        has: 0,
        need: randomAmount,
        redeemed: false,
        awards: getDailyAwardOptions(),
      });
    }
  }

  return newDailies;
};

export { calculateUserDailies };
