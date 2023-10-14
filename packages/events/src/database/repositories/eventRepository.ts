import { BigString } from 'discordeno/types';
import { Halloween2023User, halloweenEventModel } from '../collections';
import { debugError } from '../../utils/debugError';
import { MainRedisClient } from '../databases';
import { Tricks, cooldownTime } from '../../commands/event/TrickOrTreatsCommand';
import { millisToSeconds } from '../../utils/miscUtils';

const parseMongoUserToRedisUser = (user: Halloween2023User): Halloween2023User => ({
  id: user.id,
  candies: user.candies,
  currentTrick: user.currentTrick,
  cooldown: user.cooldown,
  allTimeTricks: user.allTimeTricks,
  allTimeTreats: user.allTimeTreats,
});

const getEventUser = async (userId: BigString): Promise<Halloween2023User> => {
  const fromRedis = await MainRedisClient.get(`halloween_user:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  let fromMongo = await halloweenEventModel.findOne({ id: `${userId}` }).catch(debugError);

  if (!fromMongo) fromMongo = await halloweenEventModel.create({ id: `${userId}` });

  await MainRedisClient.setex(
    `halloween_user:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const getUserTrick = async (userId: BigString): Promise<Tricks | null> =>
  MainRedisClient.get(`tricks:${userId}`).then((a) => (a ? Number(a) : null));

const setUserTrick = async (userId: BigString, trick: Tricks): Promise<void> => {
  await MainRedisClient.setex(`tricks:${userId}`, millisToSeconds(cooldownTime), trick);
};

const updateUser = async (userId: BigString, query: Partial<Halloween2023User>): Promise<void> => {
  await halloweenEventModel.updateOne({ id: `${userId}` }, query).catch(debugError);

  const fromRedis = await MainRedisClient.get(`halloween_user:${userId}`).catch(debugError);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `halloween_user:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, ...query })),
    ).catch(debugError);
  }
};

export default { getEventUser, updateUser, getUserTrick, setUserTrick };
