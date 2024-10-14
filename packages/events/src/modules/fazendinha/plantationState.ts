import { minutesToMillis } from '../../utils/miscUtils';
import { CempasuchilPlant, PLANTATION_WEIGHT_MODIFIERS, Plants } from './constants';
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
  const plantData = Plants[plant];

  let minValue = PLANTATION_WEIGHT_MODIFIERS.BASE_MIN_VALUE;
  let maxValue = PLANTATION_WEIGHT_MODIFIERS.BASE_MAX_VALUE;

  if (currentSeason === plantData.bestSeason)
    maxValue += PLANTATION_WEIGHT_MODIFIERS.BEST_SEASON_BUFF;

  if (currentSeason === plantData.worstSeason)
    minValue -= PLANTATION_WEIGHT_MODIFIERS.WORST_SEASON_DEBUFF;

  if (fieldUpgrades.some((a) => a.type === 'dirt_quality' && a.usages <= 3)) {
    maxValue += PLANTATION_WEIGHT_MODIFIERS.DIRT_QUALITY_MAX_BUFF;
    minValue += PLANTATION_WEIGHT_MODIFIERS.DIRT_QUALITY_MIN_BUFF;
  }

  if (plant === CempasuchilPlant) maxValue += PLANTATION_WEIGHT_MODIFIERS.EVENT_BUFF;

  const weight = parseFloat((Math.random() * (maxValue - minValue) + minValue).toFixed(1));

  return weight;
};

export { getPlantationState, getHarvestTime, getFieldWeight };
