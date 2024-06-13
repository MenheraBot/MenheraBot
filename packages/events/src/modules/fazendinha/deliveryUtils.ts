import farmerRepository from '../../database/repositories/farmerRepository';
import { DatabaseFarmerSchema } from '../../types/database';
import { DELIVERIES_AMOUNT, MAX_DELIVERY_WEIGHT, MIN_DELIVERY_WEIGHT, Plants } from './constants';
import { DeliveryMission } from './types';

const getRandomAmount = (): number => {
  return parseFloat(
    (Math.random() * (MAX_DELIVERY_WEIGHT - MIN_DELIVERY_WEIGHT + 1) + MIN_DELIVERY_WEIGHT).toFixed(
      1,
    ),
  );
};

const calculateUserDailyDeliveries = (): DeliveryMission[] => {
  const toReturnDailies: DeliveryMission[] = [];

  for (let i = 0; i < DELIVERIES_AMOUNT; i++) {
    const neededPlants = getRandomAmount();
    const plantType = Math.floor(Math.random() * 25);
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

  const newDeliveries = calculateUserDailyDeliveries();

  farmerRepository.updateDeliveries(farmer.id, newDeliveries);

  return newDeliveries;
};

export { calculateUserDailyDeliveries, getUserDeliveries };
