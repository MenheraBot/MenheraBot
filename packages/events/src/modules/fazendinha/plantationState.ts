import { logger } from '../../utils/logger';
import { minutesToMillis } from '../../utils/miscUtils';
import { Plants } from './constants';
import {
  SEASONAL_HARVEST_BUFF,
  SEASONAL_HARVEST_DEBUFF,
  SEASONAL_ROT_DEBUFF,
} from './seasonsManager';
import { AvailablePlants, FieldUpgrade, Plantation, PlantationState, Seasons } from './types';

const getPlantationState = (field: Plantation): [PlantationState, number] => {
  if (!field.isPlanted) return ['EMPTY', -1];

  const plant = Plants[field.plantType];

  if (Date.now() < field.harvestAt) return ['GROWING', field.harvestAt];

  const timeToReduce =
    field.plantedSeason === plant.worstSeason ? plant.minutesToRot * SEASONAL_ROT_DEBUFF : 0;

  const timeToRot = field.harvestAt + minutesToMillis(plant.minutesToRot - timeToReduce);

  if (Date.now() >= timeToRot) return ['ROTTEN', timeToRot];

  return ['MATURE', timeToRot];
};

const getHarvestTime = (currentSeason: Seasons, plant: AvailablePlants): number => {
  const plantFile = Plants[plant];

  if (currentSeason === plantFile.bestSeason)
    return (
      Date.now() +
      minutesToMillis(
        Math.floor(plantFile.minutesToHarvest - plantFile.minutesToHarvest * SEASONAL_HARVEST_BUFF),
      )
    );

  if (currentSeason === plantFile.worstSeason)
    return (
      Date.now() +
      minutesToMillis(
        Math.floor(
          plantFile.minutesToHarvest + plantFile.minutesToHarvest * SEASONAL_HARVEST_DEBUFF,
        ),
      )
    );

  return Date.now() + minutesToMillis(plantFile.minutesToHarvest);
};

const getFieldWeight = (
  plant: AvailablePlants,
  currentSeason: Seasons,
  fieldUpgrades: FieldUpgrade[],
): number => {
  logger.debug(plant, currentSeason, fieldUpgrades);

  return 1;
};

export { getPlantationState, getHarvestTime, getFieldWeight };
