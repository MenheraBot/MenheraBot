import { minutesToMillis } from '../../utils/miscUtils';
import { Plants } from './plants';
import { PlantState, PlantedField } from './types';

const getPlantState = (field: PlantedField): [PlantState, number] => {
  const timeToHarvest = field.plantedAt + minutesToMillis(Plants[field.plantType].minutesToHarvest);

  if (Date.now() < timeToHarvest) return ['GROWING', timeToHarvest];

  const timeToRot = timeToHarvest + minutesToMillis(Plants[field.plantType].minutesToRot);

  if (Date.now() >= timeToRot) return ['ROTTEN', timeToRot];

  return ['MATURE', timeToRot];
};

export { getPlantState };
