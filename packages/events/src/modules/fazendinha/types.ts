import { QuantitativePlant } from '../../types/database.js';

export enum AvailablePlants {
  Mate,
  Rice,
  Corn,
  Potato,
  Garlic,
  Carrot,
  Beans,
  Cucumber,
  Broccoli,
  Sunflower,
  Mint,
  Lemon,
  Strawberry,
  HotPepper,
  Eggplant,
  Avocado,
  Mango,
  Apple,
  Blueberries,
  Cabbage,
  Onion,
  Pineapple,
  Peach,
  Cherry,
  Mushroom,
}

export enum AvailableItems {
  Fertilizer,
}

export enum Seasons {
  Summer = 'summer',
  Winter = 'winter',
  Autumn = 'autumn',
  Spring = 'spring'
}

export enum PlantCategories {
  Grain,
  Root,
  Vegetable,
  CommonFruit,
  NobleFruit,
  Special,
}

export enum PlantQuality {
  Worst,
  Normal,
  Best,
}

export interface SeasonData {
  currentSeason: Seasons;
  endsAt: number;
}

interface FertilizerUpgrade {
  id: AvailableItems.Fertilizer;
  expiresAt: number;
}

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

export enum PlantationState {
  Empty = 'EMPTY',
  Growing = 'GROWING',
  Mature = 'MATURE',
  Rotten = 'ROTTEN'
}

export type Plantation = PlantedField | EmptyField;

export interface PlantsFile {
  minutesToHarvest: number;
  minutesToRot: number;
  emoji: string;
  sellValue: number;
  buyValue: number;
  bestSeason: Seasons;
  worstSeason: Seasons;
  category: PlantCategories;
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
