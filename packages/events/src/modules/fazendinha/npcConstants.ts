import {
  AvailableNpcs,
  AvailablePlants,
  NeighborNpc,
  PlantCategories,
  PlantQuality,
} from './types.js';

const NeighborsNpcs: Record<AvailableNpcs, NeighborNpc> = {
  [AvailableNpcs.SeuZe]: {
    baseDifficulty: 1,
    contractTypes: ['category', 'plant'],
    name: 'Seu Zé',
    preferences: {
      categories: [PlantCategories.Grain],
      plants: [AvailablePlants.Corn, AvailablePlants.Rice],
      quality: [PlantQuality.Worst, PlantQuality.Normal],
      seasons: [],
    },
  },
};

export { NeighborsNpcs };
