import { AvailablePlants, PlantsFile } from './types';

const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 1,
    minutesToRot: 1,
    emoji: '🌿',
    sellValue: 100,
  },
  [AvailablePlants.Rice]: {
    minutesToHarvest: 1,
    minutesToRot: 2,
    emoji: '🌾',
    sellValue: 200,
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 0.5,
    minutesToRot: 1,
    emoji: '🌻',
    sellValue: 300,
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 0.5,
    minutesToRot: 1,
    emoji: '🍄',
    sellValue: 400,
  },
};

export { Plants };
