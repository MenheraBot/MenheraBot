import { BigString } from 'discordeno/types';

import { StoredBlackjackState } from '../../modules/blackjack/types';
import { RedisClient } from '../databases';
import { debugError } from '../../utils/debugError';

const updateBlackjackState = async (
  userId: BigString,
  blackjackId: BigString,
  blackjackState: StoredBlackjackState,
): Promise<void> => {
  await RedisClient.set(`blackjack:${userId}-${blackjackId}`, JSON.stringify(blackjackState)).catch(
    debugError,
  );
};

const invalidateBlackjackState = async (
  userId: BigString,
  blackjackId: BigString,
): Promise<void> => {
  await RedisClient.del(`blackjack:${userId}-${blackjackId}`);
};

const getBlackjackState = async (
  userId: BigString,
  blackjackId: BigString,
): Promise<StoredBlackjackState | null> => {
  const fromRedis = await RedisClient.get(`blackjack:${userId}-${blackjackId}`);

  if (!fromRedis) return null;

  return JSON.parse(fromRedis);
};

export default {
  updateBlackjackState,
  invalidateBlackjackState,
  getBlackjackState,
};
