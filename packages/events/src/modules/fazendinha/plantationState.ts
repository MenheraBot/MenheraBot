import { minutesToMillis } from '../../utils/miscUtils.js';
import { PLANTATION_HARVEST_MODIFIERS, PLANTATION_WEIGHT_MODIFIERS, Plants } from './constants.js';
import {
  SEASONAL_HARVEST_BUFF,
  SEASONAL_HARVEST_DEBUFF,
  SEASONAL_ROT_DEBUFF,
} from './seasonsManager.js';
import {
  AvailableItems,
  AvailablePlants,
  FieldUpgrade,
  Plantation,
  PlantationState,
  Seasons,
} from './types.js';

const isUpgradeApplied = (buff: AvailableItems, upgrades: FieldUpgrade[]): boolean =>
  upgrades.some((u) => u.id === buff && u.expiresAt > Date.now());

const getPlantationState = (field: Plantation): [PlantationState, number] => {
  if (!field.isPlanted) return [PlantationState.Empty, -1];

  const plant = Plants[field.plantType];

  if (Date.now() < field.harvestAt) return [PlantationState.Growing, field.harvestAt];

  const timeToReduce =
    field.plantedSeason === plant.worstSeason ? plant.minutesToRot * SEASONAL_ROT_DEBUFF : 0;

  const timeToRot = field.harvestAt + minutesToMillis(plant.minutesToRot - timeToReduce);

  if (Date.now() >= timeToRot) return [PlantationState.Rotten, timeToRot];

  return [PlantationState.Mature, timeToRot];
};

const getHarvestTime = (
  currentSeason: Seasons,
  plant: AvailablePlants,
  fieldUpgrades: FieldUpgrade[],
): number => {
  const plantFile = Plants[plant];

  let timeToReduce = 0;

  if (isUpgradeApplied(AvailableItems.Fertilizer, fieldUpgrades))
    timeToReduce +=
      plantFile.minutesToHarvest * PLANTATION_HARVEST_MODIFIERS.FERTILIZER_HARVERST_BUFF;

  if (currentSeason === plantFile.bestSeason)
    timeToReduce += plantFile.minutesToHarvest * SEASONAL_HARVEST_BUFF;

  if (currentSeason === plantFile.worstSeason)
    timeToReduce -= plantFile.minutesToHarvest * SEASONAL_HARVEST_DEBUFF;

  return Date.now() + Math.floor(minutesToMillis(plantFile.minutesToHarvest - timeToReduce));
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

  if (isUpgradeApplied(AvailableItems.Fertilizer, fieldUpgrades)) {
    maxValue += PLANTATION_WEIGHT_MODIFIERS.FERTILIZER_MAX_BUFF;
    minValue += PLANTATION_WEIGHT_MODIFIERS.FERTILIZER_MIN_BUFF;
  }

  if (minValue < 0)
    throw new Error(
      `getFieldWeight generated a negative value. PlantData: ${JSON.stringify(plantData)}. CurrentSeason: ${currentSeason}. FieldUpgrades: ${JSON.stringify(fieldUpgrades)}. MinValue: ${minValue}. MaxValue: ${maxValue}`,
    );

  const weight = parseFloat((Math.random() * (maxValue - minValue) + minValue).toFixed(1));

  return weight;
};

export { getPlantationState, getHarvestTime, getFieldWeight, isUpgradeApplied };
