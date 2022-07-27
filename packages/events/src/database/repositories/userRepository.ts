import { UpdateQuery } from 'mongoose';

import { usersModel } from '../collections';
import { DatabaseUserSchema, UserIdType } from '../../types/database';
import { RedisClient } from '../databases';

const parseMongoUserToRedisUser = (user: DatabaseUserSchema): DatabaseUserSchema => ({
  angels: user.angels,
  ban: user.ban,
  banReason: user.banReason,
  lastCommandAt: user.lastCommandAt,
  archangels: user.archangels,
  badges: user.badges,
  id: user.id,
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
  itemsLimit: user.itemsLimit,
  mamado: user.mamado,
  mamou: user.mamou,
  married: user.married,
  marriedAt: user.marriedAt,
  marriedDate: user.marriedDate,
  rolls: user.rolls,
  selectedColor: user.selectedColor,
  trisal: user.trisal,
  voteCooldown: user.voteCooldown,
  votes: user.votes,
});

const updateUser = async (
  userId: UserIdType,
  query: UpdateQuery<DatabaseUserSchema>,
): Promise<void> => {
  await usersModel.updateOne({ id: userId }, { ...query, lastCommandAt: Date.now() });

  const fromRedis = await RedisClient.get(`user:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    console.log('old', data);
    console.log('after', { ...data, ...query });

    await RedisClient.setex(`user:${userId}`, 3600, JSON.stringify({ ...data, ...query }));
  }
};

const findOrCreate = async (
  userId: UserIdType,
  projection: Array<keyof DatabaseUserSchema> = [],
): Promise<DatabaseUserSchema> => {
  const fromRedis = await RedisClient.get(`user:${userId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await usersModel.findOne({ id: userId }, projection);

  if (!fromMongo) {
    const newUser = await usersModel.create({ id: userId });

    await RedisClient.setex(
      `user:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    );

    return newUser;
  }

  await RedisClient.setex(
    `user:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  );

  return fromMongo;
};

const getBannedUserInfo = async (userId: UserIdType): Promise<DatabaseUserSchema | null> => {
  return usersModel.findOne({ id: userId }, ['ban', 'banReason'], { lean: true });
};

export default { updateUser, getBannedUserInfo, findOrCreate };
