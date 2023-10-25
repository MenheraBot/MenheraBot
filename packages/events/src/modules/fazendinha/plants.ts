import { AvailablePlants, PlantsFile } from './types';

const Plants: { [Plant in AvailablePlants]: PlantsFile } = {
  [AvailablePlants.Mate]: {
    minutesToHarvest: 15,
    minutesToRot: 60,
    emoji: '🌿',
    sellValue: 300,
    buyValue: 0,
  },
  [AvailablePlants.Rice]: {
    minutesToHarvest: 30,
    minutesToRot: 60,
    emoji: '🌾',
    sellValue: 1400,
    buyValue: 730,
  },
  [AvailablePlants.Corn]: {
    minutesToHarvest: 30,
    minutesToRot: 80,
    emoji: '🌽',
    sellValue: 1100,
    buyValue: 620,
  },
  [AvailablePlants.Potato]: {
    minutesToHarvest: 45,
    minutesToRot: 40,
    emoji: '🥔',
    sellValue: 2000,
    buyValue: 1020,
  },
  [AvailablePlants.Garlic]: {
    minutesToHarvest: 45,
    minutesToRot: 60,
    emoji: '🧄',
    sellValue: 1960,
    buyValue: 980,
  },
  [AvailablePlants.Carrot]: {
    minutesToHarvest: 45,
    minutesToRot: 30,
    emoji: '🥕',
    sellValue: 2600,
    buyValue: 1400,
  },
  [AvailablePlants.Tomato]: {
    minutesToHarvest: 60,
    minutesToRot: 60,
    emoji: '🍅',
    sellValue: 4200,
    buyValue: 2100,
  },
  [AvailablePlants.Cucumber]: {
    minutesToHarvest: 60,
    minutesToRot: 90,
    emoji: '🥒',
    sellValue: 4000,
    buyValue: 1900,
  },
  [AvailablePlants.Broccoli]: {
    minutesToHarvest: 75,
    minutesToRot: 80,
    emoji: '🥦',
    sellValue: 5000,
    buyValue: 2500,
  },
  [AvailablePlants.Sunflower]: {
    minutesToHarvest: 75,
    minutesToRot: 120,
    emoji: '🌻',
    sellValue: 5000,
    buyValue: 2600,
  },
  [AvailablePlants.Mint]: {
    minutesToHarvest: 80,
    minutesToRot: 30,
    emoji: '🍃',
    sellValue: 5800,
    buyValue: 2910,
  },
  [AvailablePlants.Watermelon]: {
    minutesToHarvest: 100,
    minutesToRot: 60,
    emoji: '🍉',
    sellValue: 7400,
    buyValue: 3700,
  },
  [AvailablePlants.Strawberry]: {
    minutesToHarvest: 100,
    minutesToRot: 40,
    emoji: '🍓',
    sellValue: 8000,
    buyValue: 4100,
  },
  [AvailablePlants.HotPepper]: {
    minutesToHarvest: 100,
    minutesToRot: 50,
    emoji: '🌶',
    sellValue: 12_000,
    buyValue: 6400,
  },
  [AvailablePlants.Eggplant]: {
    minutesToHarvest: 80,
    minutesToRot: 60,
    emoji: '🍆',
    sellValue: 16_000,
    buyValue: 8000,
  },
  [AvailablePlants.Avocado]: {
    minutesToHarvest: 60,
    minutesToRot: 20,
    emoji: '🥑',
    sellValue: 16_400,
    buyValue: 8310,
  },
  [AvailablePlants.Mango]: {
    minutesToHarvest: 90,
    minutesToRot: 50,
    emoji: '🥭',
    sellValue: 17_000,
    buyValue: 8500,
  },
  [AvailablePlants.Apple]: {
    minutesToHarvest: 70,
    minutesToRot: 30,
    emoji: '🍎',
    sellValue: 18_000,
    buyValue: 9000,
  },
  [AvailablePlants.Lemon]: {
    minutesToHarvest: 60,
    minutesToRot: 10,
    emoji: '🍋',
    sellValue: 22_000,
    buyValue: 11_000,
  },
  [AvailablePlants.Tangerine]: {
    minutesToHarvest: 80,
    minutesToRot: 60,
    emoji: '🍊',
    sellValue: 20_000,
    buyValue: 9000,
  },
  [AvailablePlants.Banana]: {
    minutesToHarvest: 100,
    minutesToRot: 100,
    emoji: '🍌',
    sellValue: 26_000,
    buyValue: 13_000,
  },
  [AvailablePlants.Pineapple]: {
    minutesToHarvest: 90,
    minutesToRot: 30,
    emoji: '🍍',
    sellValue: 36_000,
    buyValue: 18_000,
  },
  [AvailablePlants.Peach]: {
    minutesToHarvest: 130,
    minutesToRot: 60,
    emoji: '🍑',
    sellValue: 44_000,
    buyValue: 22_000,
  },
  [AvailablePlants.Cherry]: {
    minutesToHarvest: 160,
    minutesToRot: 60,
    emoji: '🍒',
    sellValue: 59_000,
    buyValue: 29_500,
  },
  [AvailablePlants.Mushroom]: {
    minutesToHarvest: 200,
    minutesToRot: 3,
    emoji: '🍄',
    sellValue: 166_840,
    buyValue: 83_420,
  },
};

export { Plants };