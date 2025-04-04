import { hoursToMillis } from '../../utils/miscUtils';
import { AvailableItems, AvailablePlants, ItemsFile, PlantsFile, UnlockFieldFile } from './types';

export const INITIAL_LIMIT_FOR_SILO = 35;
export const SILO_LIMIT_INCREASE_BY_LEVEL = 5;
export const MAX_SILO_UPGRADES = 15;

export const MAX_ITEMS_IN_FAIR_PER_USER = 6;
export const MAXIMUM_PRICE_TO_SELL_IN_FAIR = 1.5;
export const MINIMUM_PRICE_TO_SELL_IN_FAIR = 0.65;
export const MAX_ITEMS_PER_FAIR_PAGE = 20;

export const DELIVERIES_AMOUNT = 6;
export const MAX_DELIVERY_WEIGHT = 9;
export const MIN_DELIVERY_WEIGHT = 5;
export const FINISH_ALL_DELIVERIES_BONUS = 30_000;

export const PLANTATION_WEIGHT_MODIFIERS = {
  BASE_MIN_VALUE: 0.7,
  BASE_MAX_VALUE: 1.3,
  BEST_SEASON_BUFF: 0.2,
  WORST_SEASON_DEBUFF: 0.2,
  FERTILIZER_MAX_BUFF: 0.5,
  FERTILIZER_MIN_BUFF: 0.3,
};

export const PLANTATION_HARVEST_MODIFIERS = {
  FERTILIZER_HARVERST_BUFF: 15 / 100,
};

export const UnloadFields: { [field: number]: UnlockFieldFile } = {
  1: {
    cost: 50_000,
    neededPlants: [
      { weight: 5, plant: AvailablePlants.Mate },
      { weight: 3, plant: AvailablePlants.Sunflower },
      { weight: 2, plant: AvailablePlants.Tomato },
      { weight: 10, plant: AvailablePlants.Garlic },
    ],
  },
  2: {
    cost: 100_000,
    neededPlants: [
      { weight: 10, plant: AvailablePlants.Mate },
      { weight: 5, plant: AvailablePlants.Potato },
      { weight: 3, plant: AvailablePlants.Apple },
      { weight: 4, plant: AvailablePlants.Mango },
      { weight: 6, plant: AvailablePlants.Pineapple },
    ],
  },
};

export const Items: { [Item in AvailableItems]: ItemsFile } = {
  [AvailableItems.Fertilizer]: {
    duration: hoursToMillis(6),
    emoji: '<:fertilizer:1316543322139136095>',
  },
};

export const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: process.env.NODE_ENV === 'production' ? 15 : 0.1,
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
    buyValue: 50,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Potato]: {
    minutesToHarvest: 45,
    minutesToRot: 40,
    emoji: '🥔',
    sellValue: 193,
    buyValue: 70,
    bestSeason: 'autumn',
    worstSeason: 'summer',
  },
  [AvailablePlants.Garlic]: {
    minutesToHarvest: 45,
    minutesToRot: 60,
    emoji: '🧄',
    sellValue: 231,
    buyValue: 90,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
  [AvailablePlants.Carrot]: {
    minutesToHarvest: 45,
    minutesToRot: 30,
    emoji: '🥕',
    sellValue: 271,
    buyValue: 100,
    bestSeason: 'spring',
    worstSeason: 'summer',
  },
  [AvailablePlants.Tomato]: {
    minutesToHarvest: 60,
    minutesToRot: 60,
    emoji: '🍅',
    sellValue: 357,
    buyValue: 110,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cucumber]: {
    minutesToHarvest: 60,
    minutesToRot: 90,
    emoji: '🥒',
    sellValue: 385,
    buyValue: 120,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Broccoli]: {
    minutesToHarvest: 75,
    minutesToRot: 80,
    emoji: '🥦',
    sellValue: 442,
    buyValue: 130,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 75,
    minutesToRot: 120,
    emoji: '🌻',
    sellValue: 421,
    buyValue: 140,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Mint]: {
    minutesToHarvest: 80,
    minutesToRot: 30,
    emoji: '🍃',
    sellValue: 558,
    buyValue: 150,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Watermelon]: {
    minutesToHarvest: 100,
    minutesToRot: 60,
    emoji: '🍉',
    sellValue: 714,
    buyValue: 170,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Strawberry]: {
    minutesToHarvest: 100,
    minutesToRot: 40,
    emoji: '🍓',
    sellValue: 885,
    buyValue: 190,
    bestSeason: 'autumn',
    worstSeason: 'winter',
  },
  [AvailablePlants.HotPepper]: {
    minutesToHarvest: 100,
    minutesToRot: 50,
    emoji: '🌶',
    sellValue: 1071,
    buyValue: 264,
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
    buyValue: 942,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Apple]: {
    minutesToHarvest: 110,
    minutesToRot: 30,
    emoji: '🍎',
    sellValue: 2714,
    buyValue: 1206,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Lemon]: {
    minutesToHarvest: 130,
    minutesToRot: 10,
    emoji: '🍋',
    sellValue: 3000,
    buyValue: 1616,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cabbage]: {
    minutesToHarvest: 150,
    minutesToRot: 60,
    emoji: '🥬',
    sellValue: 3285,
    buyValue: 1851,
    bestSeason: 'winter',
    worstSeason: 'spring',
  },
  [AvailablePlants.Banana]: {
    minutesToHarvest: 160,
    minutesToRot: 100,
    emoji: '🍌',
    sellValue: 3714,
    buyValue: 2318,
    bestSeason: 'summer',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Pineapple]: {
    minutesToHarvest: 170,
    minutesToRot: 30,
    emoji: '🍍',
    sellValue: 4714,
    buyValue: 2604,
    bestSeason: 'summer',
    worstSeason: 'spring',
  },
  [AvailablePlants.Peach]: {
    minutesToHarvest: 180,
    minutesToRot: 60,
    emoji: '🍑',
    sellValue: 5571,
    buyValue: 3108,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cherry]: {
    minutesToHarvest: 200,
    minutesToRot: 60,
    emoji: '🍒',
    sellValue: 6428,
    buyValue: 3318,
    bestSeason: 'autumn',
    worstSeason: 'winter',
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 220,
    minutesToRot: 2,
    emoji: '🍄',
    sellValue: 8175,
    buyValue: 3689,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
};
