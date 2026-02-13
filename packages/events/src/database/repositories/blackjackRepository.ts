import { BigString } from '@discordeno/bot';

import { StoredBlackjackState } from '../../modules/blackjack/types.js';
import { MainRedisClient } from '../databases.js';
import { debugError } from '../../utils/debugError.js';
import { millisToSeconds, minutesToMillis } from '../../utils/miscUtils.js';

const FIFTEEN_MINUTES = millisToSeconds(minutesToMillis(15));

const updateBlackjackState = async (
  userId: BigString,
  blackjackState: StoredBlackjackState,
): Promise<void> => {
  await MainRedisClient.set(`blackjack:${userId}`, JSON.stringify(blackjackState)).catch(
    debugError,
  );
};

const invalidateBlackjackState = async (userId: BigString): Promise<void> => {
  await MainRedisClient.del(`blackjack:${userId}`);
};

const getBlackjackState = async (userId: BigString): Promise<StoredBlackjackState | null> => {
  const fromRedis = await MainRedisClient.get(`blackjack:${userId}`);

  if (!fromRedis) return null;

  return JSON.parse(fromRedis);
};

const setValidUrl = async (url: string): Promise<void> => {
  await MainRedisClient.setex(`blackjack_url:${url}`, FIFTEEN_MINUTES, 1);
};

const isUrlValid = async (url: string): Promise<boolean> =>
  MainRedisClient.getdel(`blackjack_url:${url}`).then((r) => r === `${1}`);

export default {
  updateBlackjackState,
  isUrlValid,
  invalidateBlackjackState,
  getBlackjackState,
  setValidUrl,
};
