import { AvailablePlants, PlantsFile } from './types';

const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 1,
    minutesToRot: 1,
    emoji: '🌿',
  },
  [AvailablePlants.Rice]: {
    minutesToHarvest: 1,
    minutesToRot: 2,
    emoji: '🌾',
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 0.5,
    minutesToRot: 1,
    emoji: '🌻',
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 0.5,
    minutesToRot: 1,
    emoji: '🍄',
  },
};

export { Plants };
