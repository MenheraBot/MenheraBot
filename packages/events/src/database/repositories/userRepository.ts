import { UpdateQuery } from 'mongoose';

import { BigString } from 'discordeno/types';
import { usersModel } from '../collections';
import { DatabaseUserSchema, UserIdType } from '../../types/database';
import { RedisClient } from '../databases';
import { debugError } from '../../utils/debugError';

const parseMongoUserToRedisUser = (user: DatabaseUserSchema): DatabaseUserSchema => ({
  _id: `${user._id}`,
  id: `${user.id}`,
  angels: user.angels,
  ban: user.ban,
  banReason: user.banReason,
  bannedSince: user.bannedSince,
  lastCommandAt: user.lastCommandAt,
  archangels: user.archangels,
  badges: user.badges,
  colors: user.colors,
  demigods: user.demigods,
  demons: user.demons,
  estrelinhas: user.estrelinhas,
  giants: user.giants,
  gods: user.gods,
  hiddingBadges: user.hiddingBadges,
  huntCooldown: user.huntCooldown,
  info: user.info,
  inUseItems: user.inUseItems,
  inventory: user.inventory,
  isBot: user.isBot,
  mamado: user.mamado,
  mamou: user.mamou,
  married: user.married ? `${user.married}` : null,
  marriedAt: user.marriedAt,
  marriedDate: user.marriedDate,
  rolls: user.rolls,
  selectedColor: user.selectedColor,
  trisal: user.trisal ? user.trisal.map((usr) => `${usr}`) : [],
  voteCooldown: user.voteCooldown,
  votes: user.votes,
});

const findUser = async (userId: UserIdType): Promise<DatabaseUserSchema | null> => {
  const fromRedis = await RedisClient.get(`user:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await usersModel.findOne({ id: userId }).catch(debugError);

  if (fromMongo) {
    await RedisClient.setex(
      `user:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
    ).catch(debugError);

    return fromMongo;
  }

  return null;
};

const updateUser = async (
  userId: UserIdType,
  query: Partial<DatabaseUserSchema>,
): Promise<void> => {
  await usersModel
    .updateOne({ id: userId }, { ...query, lastCommandAt: Date.now() })
    .catch(debugError);

  const fromRedis = await RedisClient.get(`user:${userId}`).catch(debugError);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await RedisClient.setex(
      `user:${userId}`,
      3600,
      JSON.stringify(
        parseMongoUserToRedisUser({ ...data, ...query, lastCommandAt: Date.now(), id: userId }),
      ),
    ).catch(debugError);
  }
};

const updateUserWithSpecialData = async (
  userId: UserIdType,
  query: UpdateQuery<DatabaseUserSchema>,
): Promise<void> => {
  const updatedUser = await usersModel
    .findOneAndUpdate({ id: userId }, { ...query, lastCommandAt: Date.now() }, { new: true })
    .catch(() => null);

  if (updatedUser) {
    await RedisClient.setex(
      `user:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
  }
};

const multiUpdateUsers = async (
  userIds: string[],
  query: UpdateQuery<DatabaseUserSchema>,
): Promise<void> => {
  await usersModel
    .updateMany({ id: { $in: userIds } }, { ...query, lastCommandAt: Date.now() })
    .catch(debugError);

  userIds.forEach(async (id) => {
    const fromRedis = await RedisClient.get(`user:${id}`).catch(debugError);

    if (fromRedis) {
      const data = JSON.parse(fromRedis);

      await RedisClient.setex(
        `user:${id}`,
        3600,
        JSON.stringify(
          parseMongoUserToRedisUser({ ...data, ...query, lastCommandAt: Date.now(), id }),
        ),
      ).catch(debugError);
    }
  });
};

const ensureFindUser = async (userId: UserIdType): Promise<DatabaseUserSchema> => {
  const fromRedis = await RedisClient.get(`user:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await usersModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await usersModel.create({ id: userId });

    await RedisClient.setex(
      `user:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await RedisClient.setex(
    `user:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const invalidateUserCache = async (userId: BigString): Promise<void> => {
  await RedisClient.del(`user:${userId}`);
};

const getBannedUserInfo = async (userId: UserIdType): Promise<DatabaseUserSchema | null> => {
  return usersModel
    .findOne({ id: userId }, ['ban', 'banReason', 'bannedSince'], { lean: true })
    .catch(debugError);
};

const getTopRanking = async (
  field: keyof DatabaseUserSchema,
  skip: number,
  ignoreUsers: string[] = [],
  limit = 10,
): Promise<Array<{ id: number; value: number }>> => {
  const res = await usersModel.find({ ban: false, id: { $nin: ignoreUsers } }, [field, 'id'], {
    skip,
    limit,
    sort: { [field]: -1 },
    lean: true,
  });

  return res.map((a) => ({ id: a.id, value: a[field] }));
};

export default {
  updateUser,
  getBannedUserInfo,
  getTopRanking,
  invalidateUserCache,
  ensureFindUser,
  updateUserWithSpecialData,
  findUser,
  multiUpdateUsers,
};
