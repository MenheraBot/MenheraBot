import { BigString } from 'discordeno/types';

import { farmerModel } from '../collections';
import { DatabaseFarmerSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { debugError } from '../../utils/debugError';

const parseMongoUserToRedisUser = (user: DatabaseFarmerSchema): DatabaseFarmerSchema => ({
  id: `${user.id}`,
  maxFields: user.maxFields,
  plantations: user.plantations,
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

export default {
  getFarmer,
};