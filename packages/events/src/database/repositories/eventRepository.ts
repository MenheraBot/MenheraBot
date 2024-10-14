import { BigString } from 'discordeno/types';
import { UpdateQuery } from 'mongoose';
import { DatabaseEventSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { debugError } from '../../utils/debugError';
import { registerCacheStatus } from '../../structures/initializePrometheus';
import { eventModel } from '../collections';

const parseMongoUserToRedisUser = (user: DatabaseEventSchema): DatabaseEventSchema => ({
  userId: user.userId,
  currency: user.currency,
});

const getUser = async (userId: BigString): Promise<DatabaseEventSchema> => {
  const fromRedis = await MainRedisClient.get(`event_user:${userId}`).catch(debugError);

  registerCacheStatus(fromRedis, 'event_user');

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await eventModel.findOne({ userId: `${userId}` }).catch(debugError);

  if (!fromMongo) {
    const newUser = await eventModel.create({ userId: `${userId}` });

    await MainRedisClient.setex(
      `event_user:${userId}`,
      604800,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await MainRedisClient.setex(
    `event_user:${userId}`,
    604800,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const updateUser = async (
  userId: BigString,
  query: UpdateQuery<DatabaseEventSchema>,
): Promise<void> => {
  await eventModel.updateOne({ userId: `${userId}` }, query).catch(debugError);

  await MainRedisClient.del(`event_user:${userId}`).catch(debugError);
};

const incrementUserCurrency = async (userId: BigString, toIncrement: number): Promise<void> =>
  updateUser(userId, { $inc: { currency: toIncrement } });

export default { getUser, incrementUserCurrency };
