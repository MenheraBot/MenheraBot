import { AvailablePlants, PlantsFile, UnlockFieldFile } from './types';

export const INITIAL_LIMIT_FOR_SILO = 35;
export const SILO_LIMIT_INCREASE_BY_LEVEL = 5;

export const MAX_DAILY_AT_FULL_LEVEL = 9;
export const MIN_DAILY_AT_LEVEL_ZERO = 3;
export const MAX_DAILY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL = 14;

export const UnloadFields: { [field: number]: UnlockFieldFile } = {
  1: {
    cost: 50_000,
    neededPlants: [
      { amount: 5, plant: AvailablePlants.Mate },
      { amount: 3, plant: AvailablePlants.Sunflower },
      { amount: 2, plant: AvailablePlants.Tomato },
      { amount: 10, plant: AvailablePlants.Garlic },
    ],
  },
  2: {
    cost: 100_000,
    neededPlants: [
      { amount: 10, plant: AvailablePlants.Mate },
      { amount: 5, plant: AvailablePlants.Potato },
      { amount: 3, plant: AvailablePlants.Apple },
      { amount: 4, plant: AvailablePlants.Mango },
      { amount: 6, plant: AvailablePlants.Pineapple },
    ],
  },
};

export const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 15,
    minutesToRot: 60,
    emoji: '🌿',
    sellValue: 110,
    buyValue: 0,
    bestSeason: 'winter',
    worstSeason: 'spring',
  },
  [AvailablePlants.Rice]: {
    minutesToHarvest: 30,
    minutesToRot: 60,
    emoji: '🌾',
    sellValue: 133,
    buyValue: 42,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Corn]: {
    minutesToHarvest: 30,
    minutesToRot: 80,
    emoji: '🌽',
    sellValue: 150,
    buyValue: 42,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Potato]: {
    minutesToHarvest: 45,
    minutesToRot: 40,
    emoji: '🥔',
    sellValue: 193,
    buyValue: 42,
    bestSeason: 'autumn',
    worstSeason: 'summer',
  },
  [AvailablePlants.Garlic]: {
    minutesToHarvest: 45,
    minutesToRot: 60,
    emoji: '🧄',
    sellValue: 231,
    buyValue: 42,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
  [AvailablePlants.Carrot]: {
    minutesToHarvest: 45,
    minutesToRot: 30,
    emoji: '🥕',
    sellValue: 271,
    buyValue: 42,
    bestSeason: 'spring',
    worstSeason: 'summer',
  },
  [AvailablePlants.Tomato]: {
    minutesToHarvest: 60,
    minutesToRot: 60,
    emoji: '🍅',
    sellValue: 357,
    buyValue: 57,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cucumber]: {
    minutesToHarvest: 60,
    minutesToRot: 90,
    emoji: '🥒',
    sellValue: 385,
    buyValue: 57,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Broccoli]: {
    minutesToHarvest: 75,
    minutesToRot: 80,
    emoji: '🥦',
    sellValue: 442,
    buyValue: 71,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 75,
    minutesToRot: 120,
    emoji: '🌻',
    sellValue: 421,
    buyValue: 71,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Mint]: {
    minutesToHarvest: 80,
    minutesToRot: 30,
    emoji: '🍃',
    sellValue: 558,
    buyValue: 85,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Watermelon]: {
    minutesToHarvest: 100,
    minutesToRot: 60,
    emoji: '🍉',
    sellValue: 714,
    buyValue: 128,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Strawberry]: {
    minutesToHarvest: 100,
    minutesToRot: 40,
    emoji: '🍓',
    sellValue: 885,
    buyValue: 185,
    bestSeason: 'autumn',
    worstSeason: 'winter',
  },
  [AvailablePlants.HotPepper]: {
    minutesToHarvest: 100,
    minutesToRot: 50,
    emoji: '🌶',
    sellValue: 1071,
    buyValue: 214,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Eggplant]: {
    minutesToHarvest: 80,
    minutesToRot: 60,
    emoji: '🍆',
    sellValue: 1571,
    buyValue: 485,
    bestSeason: 'summer',
    worstSeason: 'spring',
  },
  [AvailablePlants.Avocado]: {
    minutesToHarvest: 85,
    minutesToRot: 20,
    emoji: '🥑',
    sellValue: 1791,
    buyValue: 604,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Mango]: {
    minutesToHarvest: 90,
    minutesToRot: 50,
    emoji: '🥭',
    sellValue: 2000,
    buyValue: 642,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Apple]: {
    minutesToHarvest: 110,
    minutesToRot: 30,
    emoji: '🍎',
    sellValue: 2714,
    buyValue: 906,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Lemon]: {
    minutesToHarvest: 130,
    minutesToRot: 10,
    emoji: '🍋',
    sellValue: 3000,
    buyValue: 1016,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cabbage]: {
    minutesToHarvest: 140,
    minutesToRot: 60,
    emoji: '🥬',
    sellValue: 3285,
    buyValue: 1151,
    bestSeason: 'winter',
    worstSeason: 'spring',
  },
  [AvailablePlants.Banana]: {
    minutesToHarvest: 140,
    minutesToRot: 100,
    emoji: '🍌',
    sellValue: 3714,
    buyValue: 1318,
    bestSeason: 'summer',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Pineapple]: {
    minutesToHarvest: 160,
    minutesToRot: 30,
    emoji: '🍍',
    sellValue: 4714,
    buyValue: 1604,
    bestSeason: 'summer',
    worstSeason: 'spring',
  },
  [AvailablePlants.Peach]: {
    minutesToHarvest: 170,
    minutesToRot: 60,
    emoji: '🍑',
    sellValue: 5571,
    buyValue: 2108,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cherry]: {
    minutesToHarvest: 180,
    minutesToRot: 60,
    emoji: '🍒',
    sellValue: 6428,
    buyValue: 2318,
    bestSeason: 'autumn',
    worstSeason: 'winter',
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 200,
    minutesToRot: 2,
    emoji: '🍄',
    sellValue: 8175,
    buyValue: 2589,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
};
