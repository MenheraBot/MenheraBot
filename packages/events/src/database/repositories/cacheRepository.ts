import { User } from 'discordeno/transformers';
import { DiscordUser } from 'discordeno/types';

import { UserIdType } from '../../types/database';
import { transfromUserToDiscordUser } from '../../internals/transformers/transformUserToDiscordUser';
import { bot } from '../../index';

import { RedisClient } from '../databases';

const getDiscordUser = async (userId: UserIdType): Promise<User | null> => {
  const fromRedis = await RedisClient.get(`discord_user:${userId}`);

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
  await RedisClient.setex(`discord_user:${payload.id}`, 3600, JSON.stringify(payload));
};

export default { getDiscordUser, setDiscordUser };
