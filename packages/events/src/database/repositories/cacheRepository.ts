import { Attachment, User } from 'discordeno/transformers';
import { BigString, DiscordUser } from 'discordeno/types';

import { bot } from '../../index';
import { UserIdType } from '../../types/database';
import { debugError } from '../../utils/debugError';

import { MainRedisClient } from '../databases';
import { registerCacheStatus } from '../../structures/initializePrometheus';

const getDiscordUser = async (userId: UserIdType, lookIntoDiscord = true): Promise<User | null> => {
  if (userId === null || userId === 'null') return null;

  const fromRedis = await MainRedisClient.getex(`discord_user:${userId}`, 'EX', 604800).catch(
    debugError,
  );

  registerCacheStatus(fromRedis, 'discord_user');

  if (!fromRedis) {
    if (!lookIntoDiscord) return null;

    const fromDiscord = await bot.helpers.getUser(BigInt(userId)).catch(() => null);

    if (!fromDiscord) return null;

    setDiscordUser(bot.transformers.reverse.user(bot, fromDiscord));

    return fromDiscord;
  }

  const payload = JSON.parse(fromRedis);

  return bot.transformers.user(bot, payload);
};

const setDiscordUser = async (payload: DiscordUser): Promise<void> => {
  await MainRedisClient.setex(`discord_user:${payload.id}`, 604800, JSON.stringify(payload)).catch(
    debugError,
  );
};

const addDeletedAccount = async (users: string[]): Promise<void> => {
  await MainRedisClient.sadd('deleted_accounts', users);
};

const removeDeletedAccount = async (userId: string): Promise<void> => {
  await MainRedisClient.srem('deleted_accounts', userId);
};

const getDeletedAccounts = async (): Promise<string[]> =>
  MainRedisClient.smembers('deleted_accounts').catch((err) => {
    debugError(err);
    return [];
  });

const addCustomImageAttachment = async (
  interactionId: BigString,
  attachment: Attachment,
): Promise<void> => {
  await MainRedisClient.setex(
    `attachment:${interactionId}`,
    600,
    JSON.stringify({ ...attachment, id: `${attachment.id}` }),
  );
};

type JsonFriendlyAttachment = Attachment & { id: string };
const getCustomImageAttachment = async (
  interactionId: BigString,
): Promise<JsonFriendlyAttachment | null> => {
  const fromRedis = await MainRedisClient.get(`attachment:${interactionId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  return null;
};

export default {
  getDiscordUser,
  setDiscordUser,
  getDeletedAccounts,
  removeDeletedAccount,
  addCustomImageAttachment,
  getCustomImageAttachment,
  addDeletedAccount,
};
