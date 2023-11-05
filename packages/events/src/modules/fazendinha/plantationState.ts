import { minutesToMillis } from '../../utils/miscUtils';
import { Plants } from './plants';
import { SEASONAL_TIME_BUFF, SEASONAL_TIME_DEBUFF } from './seasonsManager';
import { AvailablePlants, Plantation, PlantationState, Seasons } from './types';

const getPlantationState = (field: Plantation): [PlantationState, number] => {
  if (!field.isPlanted) return ['EMPTY', -1];

  const timeToHarvest =
    field.harvestAt || field.plantedAt + minutesToMillis(Plants[field.plantType].minutesToHarvest);

  if (Date.now() < timeToHarvest) return ['GROWING', timeToHarvest];

  const timeToRot = timeToHarvest + minutesToMillis(Plants[field.plantType].minutesToRot);

  if (Date.now() >= timeToRot) return ['ROTTEN', timeToRot];

  return ['MATURE', timeToRot];
};

const getHarvestTime = (currentSeason: Seasons, plant: AvailablePlants): number => {
  const plantFile = Plants[plant];

  if (currentSeason === plantFile.bestSeason)
    return (
      Date.now() +
      minutesToMillis(
        Math.floor(plantFile.minutesToHarvest - plantFile.minutesToHarvest * SEASONAL_TIME_BUFF),
      )
    );

  if (currentSeason === plantFile.worstSeason)
    return (
      Date.now() +
      minutesToMillis(
        Math.floor(plantFile.minutesToHarvest + plantFile.minutesToHarvest * SEASONAL_TIME_DEBUFF),
      )
    );

  return Date.now() + minutesToMillis(plantFile.minutesToHarvest);
};

export { getPlantationState, getHarvestTime };
