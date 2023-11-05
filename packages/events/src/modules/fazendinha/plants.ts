import { AvailablePlants, PlantsFile } from './types';

const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 15,
    minutesToRot: 60,
    emoji: '🌿',
    sellValue: 300,
    buyValue: 0,
    bestSeason: 'winter',
    worstSeason: 'spring',
  },
  [AvailablePlants.Rice]: {
    minutesToHarvest: 30,
    minutesToRot: 60,
    emoji: '🌾',
    sellValue: 790,
    buyValue: 30,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Corn]: {
    minutesToHarvest: 30,
    minutesToRot: 80,
    emoji: '🌽',
    sellValue: 700,
    buyValue: 30,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Potato]: {
    minutesToHarvest: 45,
    minutesToRot: 40,
    emoji: '🥔',
    sellValue: 1120,
    buyValue: 100,
    bestSeason: 'autumn',
    worstSeason: 'summer',
  },
  [AvailablePlants.Garlic]: {
    minutesToHarvest: 45,
    minutesToRot: 60,
    emoji: '🧄',
    sellValue: 1100,
    buyValue: 100,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
  [AvailablePlants.Carrot]: {
    minutesToHarvest: 45,
    minutesToRot: 30,
    emoji: '🥕',
    sellValue: 1900,
    buyValue: 300,
    bestSeason: 'spring',
    worstSeason: 'summer',
  },
  [AvailablePlants.Tomato]: {
    minutesToHarvest: 60,
    minutesToRot: 60,
    emoji: '🍅',
    sellValue: 2500,
    buyValue: 400,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cucumber]: {
    minutesToHarvest: 60,
    minutesToRot: 90,
    emoji: '🥒',
    sellValue: 2700,
    buyValue: 400,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Broccoli]: {
    minutesToHarvest: 75,
    minutesToRot: 80,
    emoji: '🥦',
    sellValue: 3100,
    buyValue: 500,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 75,
    minutesToRot: 120,
    emoji: '🌻',
    sellValue: 2950,
    buyValue: 500,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Mint]: {
    minutesToHarvest: 80,
    minutesToRot: 30,
    emoji: '🍃',
    sellValue: 3910,
    buyValue: 600,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Watermelon]: {
    minutesToHarvest: 100,
    minutesToRot: 60,
    emoji: '🍉',
    sellValue: 5000,
    buyValue: 900,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Strawberry]: {
    minutesToHarvest: 100,
    minutesToRot: 40,
    emoji: '🍓',
    sellValue: 6200,
    buyValue: 1300,
    bestSeason: 'autumn',
    worstSeason: 'winter',
  },
  [AvailablePlants.HotPepper]: {
    minutesToHarvest: 100,
    minutesToRot: 50,
    emoji: '🌶',
    sellValue: 7500,
    buyValue: 1500,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Eggplant]: {
    minutesToHarvest: 80,
    minutesToRot: 60,
    emoji: '🍆',
    sellValue: 11_000,
    buyValue: 3400,
    bestSeason: 'summer',
    worstSeason: 'spring',
  },
  [AvailablePlants.Avocado]: {
    minutesToHarvest: 60,
    minutesToRot: 20,
    emoji: '🥑',
    sellValue: 12_540,
    buyValue: 4230,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Mango]: {
    minutesToHarvest: 90,
    minutesToRot: 50,
    emoji: '🥭',
    sellValue: 14_000,
    buyValue: 4500,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Apple]: {
    minutesToHarvest: 70,
    minutesToRot: 30,
    emoji: '🍎',
    sellValue: 19_000,
    buyValue: 6342,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Lemon]: {
    minutesToHarvest: 60,
    minutesToRot: 10,
    emoji: '🍋',
    sellValue: 21_000,
    buyValue: 7112,
    bestSeason: 'spring',
    worstSeason: 'winter',
  },
  [AvailablePlants.Tangerine]: {
    minutesToHarvest: 80,
    minutesToRot: 60,
    emoji: '🍊',
    sellValue: 23_000,
    buyValue: 8060,
    bestSeason: 'spring',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Banana]: {
    minutesToHarvest: 100,
    minutesToRot: 100,
    emoji: '🍌',
    sellValue: 26_000,
    buyValue: 9230,
    bestSeason: 'summer',
    worstSeason: 'autumn',
  },
  [AvailablePlants.Pineapple]: {
    minutesToHarvest: 90,
    minutesToRot: 30,
    emoji: '🍍',
    sellValue: 33_000,
    buyValue: 11_231,
    bestSeason: 'summer',
    worstSeason: 'spring',
  },
  [AvailablePlants.Peach]: {
    minutesToHarvest: 130,
    minutesToRot: 60,
    emoji: '🍑',
    sellValue: 39_000,
    buyValue: 14_756,
    bestSeason: 'summer',
    worstSeason: 'winter',
  },
  [AvailablePlants.Cherry]: {
    minutesToHarvest: 160,
    minutesToRot: 60,
    emoji: '🍒',
    sellValue: 45_000,
    buyValue: 16_231,
    bestSeason: 'autumn',
    worstSeason: 'winter',
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 200,
    minutesToRot: 2,
    emoji: '🍄',
    sellValue: 57_225,
    buyValue: 18_123,
    bestSeason: 'winter',
    worstSeason: 'summer',
  },
};

export { Plants };
