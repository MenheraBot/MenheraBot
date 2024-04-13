import { BigString } from 'discordeno/types';

import { farmerModel } from '../collections';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database';
import { MainRedisClient } from '../databases';
import { debugError } from '../../utils/debugError';
import {
  AvailablePlants,
  DeliveryMission,
  Plantation,
  PlantedField,
  SeasonData,
  Seasons,
} from '../../modules/fazendinha/types';
import { millisToSeconds } from '../../utils/miscUtils';

const parseMongoUserToRedisUser = (user: DatabaseFarmerSchema): DatabaseFarmerSchema => ({
  id: `${user.id}`,
  plantations: user.plantations,
  biggestSeed: user.biggestSeed,
  plantedFields: user.plantedFields,
  dailies: user.dailies,
  dailyDayId: user.dailyDayId,
  experience: user.experience,
  seeds: user.seeds,
  siloUpgrades: user.siloUpgrades,
  silo: user.silo,
  lastPlantedSeed: user.lastPlantedSeed,
});

const getFarmer = async (userId: BigString): Promise<DatabaseFarmerSchema> => {
  const fromRedis = await MainRedisClient.get(`farmer:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await farmerModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await farmerModel.create({ id: userId });

    await MainRedisClient.setex(
      `farmer:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await MainRedisClient.setex(
    `farmer:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const executeHarvest = async (
  farmerId: BigString,
  fieldIndex: number,
  field: Plantation,
  plant: AvailablePlants,
  alreadyInSilo: boolean,
  success: boolean,
  plantedFields: number,
  biggestSeed: number,
): Promise<void> => {
  const pushOrIncrement = {
    [alreadyInSilo ? '$inc' : '$push']: alreadyInSilo
      ? {
          [`silo.$[elem].amount`]: 1,
        }
      : {
          silo: {
            plant,
            amount: 1,
          },
        },
  };

  const updatedUser = await farmerModel.findOneAndUpdate(
    { id: `${farmerId}` },
    {
      $set: { [`plantations.${fieldIndex}`]: field, plantedFields, biggestSeed },
      ...(success ? pushOrIncrement : {}),
    },
    {
      arrayFilters: alreadyInSilo ? [{ 'elem.plant': plant }] : [],
      new: true,
    },
  );

  if (updatedUser)
    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
};

const updateSeeds = async (farmerId: BigString, seeds: QuantitativePlant[]): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    {
      $set: { seeds },
    },
  );

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, seeds })),
    ).catch(debugError);
  }
};

const executePlant = async (
  farmerId: BigString,
  fieldIndex: number,
  field: PlantedField,
  seed: AvailablePlants,
): Promise<void> => {
  const updatedUser = await farmerModel.findOneAndUpdate(
    { id: `${farmerId}` },
    {
      $set: { [`plantations.${fieldIndex}`]: field, lastPlantedSeed: seed },
      $inc: {
        [`seeds.$[elem].amount`]: seed === AvailablePlants.Mate ? 0 : -1,
      },
    },
    {
      arrayFilters: [{ 'elem.plant': seed }],
      new: true,
    },
  );

  if (updatedUser)
    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
};

const unlockField = async (farmerId: BigString): Promise<void> => {
  await farmerModel.updateOne(
    {
      id: `${farmerId}`,
    },
    {
      $push: { plantations: { isPlanted: false } },
    },
  );

  await MainRedisClient.del(`farmer:${farmerId}`);
};

const updateSilo = async (
  farmerId: BigString,
  silo: DatabaseFarmerSchema['silo'],
): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    {
      $set: { silo },
    },
  );

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, silo })),
    ).catch(debugError);
  }
};

const upgradeSilo = async (farmerId: BigString): Promise<void> => {
  await farmerModel.updateOne({ id: `${farmerId}` }, { $inc: { siloUpgrades: 1 } });

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, siloUpgrades: data.siloUpgrades + 1 })),
    ).catch(debugError);
  }
};

const updateDailies = async (farmerId: BigString, dailies: DeliveryMission[]): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    { $set: { dailies, dailyDayId: new Date().getDate() } },
  );

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(
        parseMongoUserToRedisUser({ ...data, dailies, dailyDayId: new Date().getDate() }),
      ),
    ).catch(debugError);
  }
};

const finishDaily = async (
  farmerId: BigString,
  dailies: DeliveryMission[],
  silo: QuantitativePlant[],
  experience: number,
): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    { $set: { silo, dailies, dailyDayId: new Date().getDate() }, $inc: { experience } },
  );

  await MainRedisClient.del(`farmer:${farmerId}`);
};

const getCurrentSeason = (): Promise<Seasons | null> =>
  MainRedisClient.get('current_season') as Promise<Seasons | null>;

const getSeasonalInfo = async (): Promise<SeasonData | null> => {
  const result = await MainRedisClient.get('seasonal_info');

  if (!result) return null;

  return JSON.parse(result);
};

const updateSeason = async (nextSeason: Seasons, endsAt: number): Promise<void> => {
  const secondsToExpire = millisToSeconds(endsAt - Date.now());

  await Promise.all([
    MainRedisClient.setex('current_season', secondsToExpire, nextSeason),
    MainRedisClient.set(
      'seasonal_info',
      JSON.stringify({
        currentSeason: nextSeason,
        endsAt,
      } satisfies SeasonData),
    ),
  ]);
};

export default {
  getFarmer,
  executePlant,
  getCurrentSeason,
  upgradeSilo,
  getSeasonalInfo,
  unlockField,
  updateSeason,
  updateSilo,
  finishDaily,
  updateSeeds,
  updateDailies,
  executeHarvest,
};
