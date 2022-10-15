import { User } from 'discordeno/transformers';
import { BigString, DiscordUser } from 'discordeno/types';

import { debugError } from '../../utils/debugError';
import { UserIdType } from '../../types/database';
import { transfromUserToDiscordUser } from '../../internals/transformers/transformUserToDiscordUser';
import { bot } from '../../index';

import { RedisClient } from '../databases';

const getDiscordUser = async (userId: UserIdType): Promise<User | null> => {
  const fromRedis = await RedisClient.get(`discord_user:${userId}`).catch(debugError);

  if (!fromRedis) {
    const fromDiscord = await bot.helpers.getUser(BigInt(userId)).catch(() => null);

    if (!fromDiscord) return null;

    setDiscordUser(transfromUserToDiscordUser(bot, fromDiscord));

    return fromDiscord;
  }

  const payload = JSON.parse(fromRedis);

  return bot.transformers.user(bot, payload);
};

const setDiscordUser = async (payload: DiscordUser): Promise<void> => {
  await RedisClient.setex(`discord_user:${payload.id}`, 3600, JSON.stringify(payload)).catch(
    debugError,
  );
};

const getRouletteUsages = async (userId: BigString): Promise<number> => {
  const res = await RedisClient.get(`roulette:${userId}`);

  if (!res) return 0;

  return Number(res);
};

const incrementRouletteHourlyUsage = async (userId: BigString): Promise<void> => {
  const expireTime = (60 - new Date().getMinutes()) * 60;

  await RedisClient.multi()
    .incr(`roulette:${userId}`)
    .expire(`roulette:${userId}`, expireTime)
    .exec();
};

export default { getDiscordUser, setDiscordUser, incrementRouletteHourlyUsage, getRouletteUsages };
