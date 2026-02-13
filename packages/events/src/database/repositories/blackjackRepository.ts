import { BigString } from '@discordeno/bot';

import { BlackjackSession, StoredBlackjackState } from '../../modules/blackjack/types.js';
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

const getBetSession = async (userId: BigString): Promise<BlackjackSession | null> => {
  const fromRedis = await MainRedisClient.get(`blackjack_session:${userId}`);

  if (!fromRedis) return null;

  return JSON.parse(fromRedis);
};

const setBetSession = async (userId: BigString, session: BlackjackSession): Promise<void> => {
  await MainRedisClient.setex(
    `blackjack_session:${userId}`,
    FIFTEEN_MINUTES,
    JSON.stringify(session),
  );
};

const destroyBetSession = async (userId: BigString): Promise<void> => {
  await MainRedisClient.del(`blackjack_session:${userId}`);
};

export default {
  updateBlackjackState,
  getBetSession,
  setBetSession,
  destroyBetSession,
  isUrlValid,
  invalidateBlackjackState,
  getBlackjackState,
  setValidUrl,
};
