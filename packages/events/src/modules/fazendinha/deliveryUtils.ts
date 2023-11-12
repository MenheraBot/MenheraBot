import farmerRepository from '../../database/repositories/farmerRepository';
import { DatabaseFarmerSchema } from '../../types/database';
import {
  MAX_DAILY_AT_FULL_LEVEL,
  MAX_DAILY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL,
  MIN_DAILY_AT_LEVEL_ZERO,
} from './constants';
import { AvailablePlants, DeliveryMission } from './types';

const getMaxUserDailies = (level: number): number =>
  Math.floor(
    level * ((MAX_DAILY_AT_FULL_LEVEL - MIN_DAILY_AT_LEVEL_ZERO) / AvailablePlants.Mushroom) +
      MIN_DAILY_AT_LEVEL_ZERO,
  );

const getRandomAmount = (level: number): number => {
  const minimal = Math.floor(level / 4) + 1;
  const maximumCount = Math.floor(level / 3) + 3;

  const maximum =
    maximumCount > MAX_DAILY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL
      ? MAX_DAILY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL
      : maximumCount;

  return Math.floor(Math.random() * (maximum - minimal + 1)) + minimal;
};

const calculateUserDailyDeliveries = (farmer: DatabaseFarmerSchema): DeliveryMission[] => {
  const userLevel = farmer.biggestSeed;
  const maxUserDailies = getMaxUserDailies(userLevel);

  const toReturnDailies: DeliveryMission[] = [];

  for (let i = 0; i < maxUserDailies; i++) {
    const neededPlants = getRandomAmount(userLevel);
    const plantType = Math.floor(Math.random() * farmer.biggestSeed);

    toReturnDailies.push({
      award: (plantType || 1) * neededPlants * 100,
      experience: (plantType + 1) * 10,
      needs: [{ amount: neededPlants, plant: plantType }],
      finished: false,
    });
  }

  return toReturnDailies;
};

const getUserDailies = (farmer: DatabaseFarmerSchema): DeliveryMission[] => {
  const isUpToDate = farmer.dailyDayId === new Date().getDate();

  if (isUpToDate) return farmer.dailies;

  const newDailies = calculateUserDailyDeliveries(farmer);

  farmerRepository.updateDailies(farmer.id, newDailies);

  return newDailies;
};

export { calculateUserDailyDeliveries, getUserDailies };
