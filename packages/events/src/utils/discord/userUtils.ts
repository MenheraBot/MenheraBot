import { ImageSize, iconBigintToHash, avatarUrl } from '@discordeno/bot';

import { toWritableUtf } from '../miscUtils.js';
import { User } from '../../types/discordeno.js';

const getUserAvatar = (
  user: User,
  { size = 256, enableGif }: { size?: ImageSize; enableGif?: boolean } = {},
): string => {
  if (user.avatar) {
    const hash = iconBigintToHash(user.avatar);

    return avatarUrl(user.id, user.discriminator, {
      avatar: hash,
      format: enableGif && hash.startsWith('a_') ? 'gif' : 'png',
      size,
    });
  }

  return avatarUrl(user.id, user.discriminator, { size, avatar: undefined });
};

const mentionUser = (userId: bigint | string): string => `<@${userId}>`;

const getDisplayName = (user: User, onlyUtf = false): string => {
  const displayName = user.globalName;

  if (!displayName) return user.username;

  const parsed = onlyUtf ? toWritableUtf(displayName).trim() : displayName;

  if (parsed.length < 2) return user.username;

  return parsed;
};

export { getUserAvatar, mentionUser, getDisplayName };
