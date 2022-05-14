import { FluffetySchema, FluffetyStatus } from '@custom_types/Menhera';
import {
  DISPLAY_FLUFFETY_ORDER,
  HOURS_TO_FULL_ENERGY,
  HOURS_TO_FULL_HAPPY,
  SLEEPING_HOURS_TO_FULL_ENERGY,
} from './Constants';

export const hoursToMilis = (hours: number) => hours * 3600000;

export const getPercentageByTimePassed = (timePassed: number, maxValue: number): number =>
  Math.min(Math.floor((100 * timePassed) / maxValue), 100);

export const getDateFromPercentage = (percentage: number, timeToFull: number): number =>
  Math.floor((percentage * timeToFull) / 100);

const getCurrentPercentagesWithAction = (
  fluffety: FluffetySchema,
  basePercentages: FluffetyStatus,
): FluffetyStatus => {
  // ENERGY

  let { energy } = basePercentages;

  switch (fluffety.currentAction.identifier) {
    case 1: {
      const energyGained = getPercentageByTimePassed(
        Date.now() - fluffety.currentAction.startAt,
        hoursToMilis(SLEEPING_HOURS_TO_FULL_ENERGY),
      );
      energy = Math.min(basePercentages.energy + energyGained, 100);
      break;
    }
  }

  return {
    happy: basePercentages.happy, // TODO
    energy,
  };
};

export const getFluffetyStats = (fluffety: FluffetySchema): FluffetyStatus => {
  const happyPercentage =
    100 - ((Date.now() - fluffety.happyAt) / hoursToMilis(HOURS_TO_FULL_HAPPY)) * 100;

  const energyPercentage =
    100 - ((Date.now() - fluffety.energyAt) / hoursToMilis(HOURS_TO_FULL_ENERGY)) * 100;

  /*   const foodPercentage =
    100 - ((Date.now() - fluffety.foodyAt) / hoursToMilis(HOURS_TO_FULL_FOOD)) * 100;

  const healthPercentage =
    100 - ((Date.now() - fluffety.healthyAt) / hoursToMilis(HOURS_TO_FULL_HEALTH)) * 100;
 */

  const basePercentages = {
    happy: Math.max(Math.floor(happyPercentage), 0),
    energy: Math.max(Math.floor(energyPercentage), 0),
    // foody: Math.max(Math.floor(foodPercentage), 0),
    // healty: Math.max(Math.floor(healthPercentage), 0),
  };

  console.log('base', basePercentages);

  return getCurrentPercentagesWithAction(fluffety, basePercentages);
};

export const getCommode = (
  houseOrder: typeof DISPLAY_FLUFFETY_ORDER,
  baseIndex: number,
  location?: 'next' | 'last',
) => {
  if (!location) return houseOrder[baseIndex];

  const arrayLength = houseOrder.length;

  if (location === 'last') return houseOrder[baseIndex === 0 ? arrayLength - 1 : baseIndex - 1];

  return houseOrder[baseIndex === arrayLength - 1 ? 0 : baseIndex + 1];
};
