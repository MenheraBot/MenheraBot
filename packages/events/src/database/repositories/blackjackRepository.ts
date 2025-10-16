import { BigString } from 'discordeno/types';

import { StoredBlackjackState } from '../../modules/blackjack/types.js';
import { MainRedisClient } from '../databases.js';
import { debugError } from '../../utils/debugError.js';

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

export default {
  updateBlackjackState,
  invalidateBlackjackState,
  getBlackjackState,
};
