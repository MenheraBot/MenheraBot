export enum AvailablePlants {
  Mate,
  Rice,
  Corn,
  Potato,
  Garlic,
  Carrot,
  Tomato,
  Cucumber,
  Broccoli,
  Sunflower,
  Mint,
  Watermelon,
  Strawberry,
  HotPepper,
  Eggplant,
  Avocado,
  Mango,
  Apple,
  Lemon,
  Tangerine,
  Banana,
  Pineapple,
  Peach,
  Cherry,
  Mushroom,
}

export type Seasons = 'summer' | 'winter' | 'autumn' | 'spring';

export interface PlantedField {
  // FIXME(ySnoopyDogy): Remove plantedAt field in next version
  plantedAt: number;
  harvestAt?: number;
  plantedSeason: Seasons;
  isPlanted: true;
  plantType: AvailablePlants;
}

export type SeasonData = {
  currentSeason: Seasons;
  endsAt: number;
};

export interface EmptyField {
  isPlanted: false;
}

export type PlantationState = 'EMPTY' | 'GROWING' | 'MATURE' | 'ROTTEN';

export type Plantation = PlantedField | EmptyField;

export interface PlantsFile {
  minutesToHarvest: number;
  minutesToRot: number;
  emoji: string;
  sellValue: number;
  buyValue: number;
  bestSeason: Seasons;
  worstSeason: Seasons;
}
