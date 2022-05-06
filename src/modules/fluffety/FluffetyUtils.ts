import { FluffetySchema, FluffetyStatus } from '@custom_types/Menhera';
import {
  HOURS_TO_FULL_ENERGY,
  HOURS_TO_FULL_FOOD,
  HOURS_TO_FULL_HAPPY,
  HOURS_TO_FULL_HEALTH,
} from './Constants';

export const hoursToMilis = (hours: number) => hours * 3600000;

export const getFluffetyStats = (fluffety: FluffetySchema): FluffetyStatus => {
  const foodPercentage =
    100 - ((Date.now() - fluffety.foodyAt) / hoursToMilis(HOURS_TO_FULL_FOOD)) * 100;

  const happyPercentage =
    100 - ((Date.now() - fluffety.happyAt) / hoursToMilis(HOURS_TO_FULL_HAPPY)) * 100;

  const energyPercentage =
    100 - ((Date.now() - fluffety.energyAt) / hoursToMilis(HOURS_TO_FULL_ENERGY)) * 100;

  const healthPercentage =
    100 - ((Date.now() - fluffety.healthyAt) / hoursToMilis(HOURS_TO_FULL_HEALTH)) * 100;

  return {
    energy: Math.max(Math.floor(energyPercentage), 0),
    foody: Math.max(Math.floor(foodPercentage), 0),
    happy: Math.max(Math.floor(happyPercentage), 0),
    healty: Math.max(Math.floor(healthPercentage), 0),
  };
};
