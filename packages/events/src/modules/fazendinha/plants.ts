import { AvailablePlants, PlantsFile } from './types';

const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 1,
    minutesToRot: 1,
    emoji: '🌿',
    sellValue: 100,
    buyValue: 0,
  },
  [AvailablePlants.Rice]: {
    minutesToHarvest: 1,
    minutesToRot: 2,
    emoji: '🌾',
    sellValue: 200,
    buyValue: 80,
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 0.5,
    minutesToRot: 1,
    emoji: '🌻',
    sellValue: 300,
    buyValue: 120,
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 0.5,
    minutesToRot: 1,
    emoji: '🍄',
    sellValue: 400,
    buyValue: 180,
  },
  [AvailablePlants.Corn]: {
    minutesToHarvest: 10,
    minutesToRot: 0.2,
    emoji: '🌽',
    sellValue: 500,
    buyValue: 220,
  },
};

export { Plants };
