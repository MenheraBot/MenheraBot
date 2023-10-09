import { AvailablePlants, PlantsFile } from './types';

const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 1,
    minutesToRot: 1,
  },
};
export { Plants };
