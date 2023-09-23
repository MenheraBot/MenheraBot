import { ImageSize, routes } from 'discordeno';
import { User } from 'discordeno/transformers';

import { bot } from '../../index';
import { toWritableUtf } from '../miscUtils';

const getUserAvatar = (
  user: User,
  { size = 256, enableGif }: { size?: ImageSize; enableGif?: boolean } = {},
): string => {
  if (user.avatar) {
    const hash = bot.utils.iconBigintToHash(user.avatar);
    return bot.utils.formatImageURL(
      routes.USER_AVATAR(user.id, hash),
      size,
      enableGif && hash.startsWith('a_') ? 'gif' : 'png',
    );
  }

  return bot.utils.formatImageURL(routes.USER_DEFAULT_AVATAR(2));
};

const mentionUser = (userId: bigint | string): string => `<@${userId}>`;

const getDisplayName = (user: User, onlyUtf = false): string => {
  // @ts-expect-error It doesnt exists yet
  const { displayName } = user;

  if (!displayName) return user.username;

  const parsed = onlyUtf ? toWritableUtf(displayName).trim() : displayName;

  if (parsed.length < 2) return user.username;

  return parsed;
};

export { getUserAvatar, mentionUser, getDisplayName };
