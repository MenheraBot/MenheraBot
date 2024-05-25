import farmerRepository from '../../database/repositories/farmerRepository';
import { DatabaseFarmerSchema } from '../../types/database';
import {
  MAX_DELIVERY_AT_FULL_LEVEL,
  MAX_DELIVERY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL,
  MIN_DELIVERY_AT_LEVEL_ZERO,
  Plants,
} from './constants';
import { AvailablePlants, DeliveryMission } from './types';

const getMaxUserDeliveries = (level: number): number =>
  Math.floor(
    level * ((MAX_DELIVERY_AT_FULL_LEVEL - MIN_DELIVERY_AT_LEVEL_ZERO) / AvailablePlants.Mushroom) +
      MIN_DELIVERY_AT_LEVEL_ZERO,
  );

const getRandomAmount = (level: number): number => {
  const minimal = Math.floor(level / 4) + 1;
  const maximumCount = Math.floor(level / 3) + 3;

  const maximum =
    maximumCount > MAX_DELIVERY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL
      ? MAX_DELIVERY_PLANTATION_REQUIREMENT_AT_FULL_LEVEL
      : maximumCount;

  return parseFloat((Math.random() * (maximum - minimal + 1) + minimal).toFixed(1));
};

const calculateUserDailyDeliveries = (farmer: DatabaseFarmerSchema): DeliveryMission[] => {
  const userLevel = farmer.biggestSeed;
  const maxUserDeliveries = getMaxUserDeliveries(userLevel);

  const toReturnDailies: DeliveryMission[] = [];

  for (let i = 0; i < maxUserDeliveries; i++) {
    const neededPlants = getRandomAmount(userLevel);
    const plantType = Math.floor(Math.random() * (farmer.biggestSeed + 1));
    const maxAward = (plantType + 1) * neededPlants * 30 + 10 * Plants[plantType as 1].sellValue;
    const minAward = maxAward * 0.7;

    const award = Math.floor(Math.random() * (maxAward - minAward) + minAward);

    toReturnDailies.push({
      award,
      experience: Math.floor((plantType + 1) * 10 + neededPlants * 50),
      needs: [{ weight: neededPlants, plant: plantType }],
      finished: false,
    });
  }

  return toReturnDailies;
};

const getUserDeliveries = (farmer: DatabaseFarmerSchema): DeliveryMission[] => {
  const isUpToDate =
    farmer.dailyDayId === new Date().getDate() &&
    farmer.dailies.every((a) => a.needs.every((b) => 'weight' in b));

  if (isUpToDate) return farmer.dailies;

  const newDeliveries = calculateUserDailyDeliveries(farmer);

  farmerRepository.updateDeliveries(farmer.id, newDeliveries);

  return newDeliveries;
};

const getFinishAllBonus = (deliveries: DeliveryMission[]): number =>
  Math.floor(deliveries.reduce((p, c) => p + c.award, 0) / 2);

export { calculateUserDailyDeliveries, getUserDeliveries, getFinishAllBonus };
