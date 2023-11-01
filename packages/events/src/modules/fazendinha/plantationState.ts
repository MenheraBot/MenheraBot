import { minutesToMillis } from '../../utils/miscUtils';
import { Plants } from './plants';
import { Plantation, PlantationState } from './types';

const getPlantationState = (field: Plantation): [PlantationState, number] => {
  if (!field.isPlanted) return ['EMPTY', -1];

  const timeToHarvest = field.plantedAt + minutesToMillis(Plants[field.plantType].minutesToHarvest);

  if (Date.now() < timeToHarvest) return ['GROWING', timeToHarvest];

  const timeToRot = timeToHarvest + minutesToMillis(Plants[field.plantType].minutesToRot);

  if (Date.now() >= timeToRot) return ['ROTTEN', timeToRot];

  return ['MATURE', timeToRot];
};

export { getPlantationState };
