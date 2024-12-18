import { QuantitativePlant } from '../../types/database';

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
  Cabbage,
  Banana,
  Pineapple,
  Peach,
  Cherry,
  Mushroom,
}

export enum AvailableItems {
  Fertilizer,
}

export type Seasons = 'summer' | 'winter' | 'autumn' | 'spring';

export type SeasonData = {
  currentSeason: Seasons;
  endsAt: number;
};

type FertilizerUpgrade = {
  id: AvailableItems.Fertilizer;
  expiresAt: number;
};

export type FieldUpgrade = FertilizerUpgrade;

export interface PlantedField {
  harvestAt: number;
  plantedSeason: Seasons;
  isPlanted: true;
  plantType: AvailablePlants;
  weight?: number;
  upgrades?: FieldUpgrade[];
}

export interface EmptyField {
  isPlanted: false;
  upgrades?: FieldUpgrade[];
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

export interface ItemsFile {
  duration: number;
  emoji: string;
}

export interface DeliveryMission {
  needs: QuantitativePlant[];
  award: number;
  experience: number;
  finished: boolean;
}

export interface UnlockFieldFile {
  neededPlants: QuantitativePlant[];
  cost: number;
}
