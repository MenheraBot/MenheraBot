import { User } from 'discordeno/transformers';
import { BigString, DiscordUser } from 'discordeno/types';

import { debugError } from '../../utils/debugError';
import { UserIdType } from '../../types/database';
import { transfromUserToDiscordUser } from '../../internals/transformers/transformUserToDiscordUser';
import { bot } from '../../index';

import { MainRedisClient } from '../databases';

const getDiscordUser = async (userId: UserIdType): Promise<User | null> => {
  if (userId === null) return null;

  const fromRedis = await MainRedisClient.get(`discord_user:${userId}`).catch(debugError);

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
  await MainRedisClient.setex(`discord_user:${payload.id}`, 3600, JSON.stringify(payload)).catch(
    debugError,
  );
};

const getRouletteUsages = async (userId: BigString): Promise<number> => {
  const res = await MainRedisClient.get(`roulette:${userId}`);

  if (!res) return 0;

  return Number(res);
};

const incrementRouletteHourlyUsage = async (userId: BigString): Promise<void> => {
  const expireTime = (60 - new Date().getMinutes()) * 60;

  await MainRedisClient.multi()
    .incr(`roulette:${userId}`)
    .expire(`roulette:${userId}`, expireTime)
    .exec();
};

const addDeletedAccount = async (users: string[]): Promise<void> => {
  await MainRedisClient.sadd('deleted_accounts', users);
};

const getDeletedAccounts = async (): Promise<string[]> =>
  MainRedisClient.smembers('deleted_accounts').catch((err) => {
    debugError(err);
    return [];
  });

export default {
  getDiscordUser,
  setDiscordUser,
  incrementRouletteHourlyUsage,
  getRouletteUsages,
  getDeletedAccounts,
  addDeletedAccount,
};
