import { BigString } from '@discordeno/bot';

import { farmerModel } from '../collections.js';
import {
  DatabaseFarmerSchema,
  QuantitativeItem,
  QuantitativePlant,
  QuantitativeSeed,
} from '../../types/database.js';
import { MainRedisClient } from '../databases.js';
import { debugError } from '../../utils/debugError.js';
import {
  AvailablePlants,
  DeliveryMission,
  Plantation,
  SeasonData,
  Seasons,
} from '../../modules/fazendinha/types.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import { registerCacheStatus } from '../../structures/initializePrometheus.js';
import { getQuality } from '../../modules/fazendinha/siloUtils.js';

const parseMongoUserToRedisUser = (user: DatabaseFarmerSchema): DatabaseFarmerSchema => ({
  id: `${user.id}`,
  plantations: user.plantations,
  dailies: user.dailies,
  dailyDayId: user.dailyDayId,
  experience: user.experience,
  seeds: user.seeds,
  items: user.items ?? [],
  siloUpgrades: user.siloUpgrades,
  silo: user.silo.map((a) => ({ ...a, weight: parseFloat((a.weight ?? a.amount).toFixed(1)) })),
  lastPlantedSeed: user.lastPlantedSeed,
  composter: user.composter ?? 0,
});

const getFarmer = async (userId: BigString): Promise<DatabaseFarmerSchema> => {
  const fromRedis = await MainRedisClient.get(`farmer:${userId}`).catch(debugError);

  registerCacheStatus(fromRedis, 'farmer');

  if (fromRedis) return parseMongoUserToRedisUser(JSON.parse(fromRedis));

  const fromMongo = await farmerModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await farmerModel.create({ id: userId });

    await MainRedisClient.setex(
      `farmer:${userId}`,
      604800,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  if (fromMongo.silo.some((a) => 'amount' in a)) {
    const newSilo = fromMongo.silo.map((a) => ({ plant: a.plant, weight: a.weight ?? a.amount }));

    await updateSilo(userId, newSilo);
    return getFarmer(userId);
  }

  await MainRedisClient.setex(
    `farmer:${userId}`,
    604800,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return parseMongoUserToRedisUser(fromMongo);
};

const updateItems = async (farmerId: BigString, items: QuantitativeItem[]): Promise<void> => {
  await farmerModel.updateOne({ id: `${farmerId}` }, { items });

  await MainRedisClient.del(`farmer:${farmerId}`);
};

const executeComposter = async (
  farmerId: BigString,
  items: QuantitativeItem[],
  composter?: number,
) => {
  const payload: Partial<DatabaseFarmerSchema> = {};

  if (items.length > 0) payload.items = items;
  if (typeof composter === 'number') payload.composter = composter;

  if (Object.keys(payload).length === 0) return;

  await farmerModel.updateOne({ id: `${farmerId}` }, payload);
  await MainRedisClient.del(`farmer:${farmerId}`);
};

const executeHarvest = async (
  farmerId: BigString,
  plantations: DatabaseFarmerSchema['plantations'],
  success: boolean,
  silo: DatabaseFarmerSchema['silo'],
  added: DatabaseFarmerSchema['silo'],
): Promise<void> => {
  const experience = added.reduce(
    (p, c) => p + Math.floor(c.weight * ((c.plant + 1) * (5 + getQuality(c)))),
    0,
  );

  const updatedUser = await farmerModel.findOneAndUpdate(
    { id: `${farmerId}` },
    {
      $set: { plantations, silo },
      ...(success ? { $inc: { experience } } : {}),
    },
    {
      new: true,
    },
  );

  if (updatedUser)
    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      604800,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
};

const updateSeeds = async (farmerId: BigString, seeds: QuantitativeSeed[]): Promise<void> => {
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
      604800,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, seeds })),
    ).catch(debugError);
  }
};

const executePlant = async (
  farmerId: BigString,
  plantations: DatabaseFarmerSchema['plantations'],
  seed: AvailablePlants,
  seeds: DatabaseFarmerSchema['seeds'],
): Promise<void> => {
  if (plantations.some((a) => a.isPlanted && a.weight && a.weight < 0))
    throw new Error(
      `Negative weight for farmer ${farmerId}. Plantations=${JSON.stringify(plantations)}. Seed: ${seed}`,
    );

  const updatedUser = await farmerModel.findOneAndUpdate(
    { id: `${farmerId}` },
    {
      $set: { plantations, lastPlantedSeed: seed, seeds },
    },
    {
      new: true,
    },
  );

  if (updatedUser)
    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      604800,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
};

const applyUpgrade = async (
  farmerId: BigString,
  items: DatabaseFarmerSchema['items'],
  fieldIndex: number,
  field: Plantation | Plantation[],
  multiple: boolean,
): Promise<void> => {
  if (multiple) {
    await farmerModel.findOneAndUpdate(
      { id: `${farmerId}` },
      {
        $set: { plantations: field, items },
      },
    );
  } else {
    await farmerModel.findOneAndUpdate(
      { id: `${farmerId}` },
      {
        $set: { [`plantations.${fieldIndex}`]: field, items },
      },
    );
  }

  await MainRedisClient.del(`farmer:${farmerId}`);
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
      604800,
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
      604800,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, siloUpgrades: data.siloUpgrades + 1 })),
    ).catch(debugError);
  }
};

const updateDeliveries = async (farmerId: BigString, dailies: DeliveryMission[]): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    { $set: { dailies, dailyDayId: new Date().getDate() } },
  );

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      604800,
      JSON.stringify(
        parseMongoUserToRedisUser({ ...data, dailies, dailyDayId: new Date().getDate() }),
      ),
    ).catch(debugError);
  }
};

const finishDelivery = async (
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

const getTopRanking = async (
  skip: number,
  ignoreUsers: string[] = [],
  limit = 10,
): Promise<{ id: string; value: number }[]> => {
  const res = await farmerModel.find({ id: { $nin: ignoreUsers } }, ['experience', 'id'], {
    skip,
    limit,
    sort: { experience: -1 },
    lean: true,
  });

  return res.map((a) => ({ id: a.id, value: a.experience ?? 0 }));
};

const updateFarmer = async (
  farmerId: string,
  silo: QuantitativePlant[],
  items: QuantitativeItem[],
) => {
  await farmerModel.updateOne({ id: `${farmerId}` }, { $set: { silo, items } });

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      604800,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, silo, items })),
    ).catch(debugError);
  }
};

export default {
  getFarmer,
  executePlant,
  getTopRanking,
  updateFarmer,
  getCurrentSeason,
  upgradeSilo,
  getSeasonalInfo,
  unlockField,
  executeComposter,
  updateSeason,
  updateSilo,
  finishDelivery,
  updateItems,
  updateSeeds,
  updateDeliveries,
  applyUpgrade,
  executeHarvest,
};
