import { minutesToMillis } from '../../utils/miscUtils';
import { Plants } from './plants';
import { PlantState, PlantedField } from './types';

const getPlantState = (field: PlantedField): PlantState => {
  const timeToHarvest = field.plantedAt + minutesToMillis(Plants[field.plantType].minutesToHarvest);

  if (Date.now() < timeToHarvest) return 'GROWING';

  const timeToRot = timeToHarvest + minutesToMillis(Plants[field.plantType].minutesToRot);

  if (Date.now() >= timeToRot) return 'ROTTEN';

  return 'MATURE';
};

export { getPlantState };
