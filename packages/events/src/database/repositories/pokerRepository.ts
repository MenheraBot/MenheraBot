import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';
import { PokerMatch, PokerTimer } from '../../modules/poker/types';
import { debugError } from '../../utils/debugError';

const isUserInMatch = async (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('poker_match', `${userId}`).then((r) => r === 1);

const addUsersInMatch = async (userIds: string[]): Promise<void> => {
  await MainRedisClient.sadd('poker_match', userIds);
};

const removeUsersInMatch = async (userIds: string[]): Promise<void> => {
  await MainRedisClient.srem(`poker_match`, userIds);
};

const setMatchState = async (matchId: BigString, matchData: PokerMatch): Promise<void> => {
  await MainRedisClient.set(`poker_table:${matchId}`, JSON.stringify(matchData));
};

const registerTimer = async (timerId: string, executeAction: PokerTimer): Promise<void> => {
  await MainRedisClient.set(`poker_timer:${timerId}`, JSON.stringify(executeAction));
};

const getTimer = async (timerId: string): Promise<PokerTimer> => {
  const timer = (await MainRedisClient.get(`poker_timer:${timerId}`)) as string;

  return JSON.parse(timer);
};

const deleteTimer = async (timerId: string): Promise<void> => {
  await MainRedisClient.del(`poker_timer:${timerId}`);
};

const getTimerKeys = async (): Promise<string[]> => {
  return MainRedisClient.keys('poker_timer:*');
};

const deleteMatchState = async (matchId: BigString): Promise<void> => {
  await MainRedisClient.del(`poker_table:${matchId}`);
};

const getMatchState = async (matchId: BigString): Promise<null | PokerMatch> => {
  const redisData = await MainRedisClient.get(`poker_table:${matchId}`);

  if (!redisData) return null;

  return JSON.parse(redisData);
};

const getTotalRunningGlobalMatches = async (): Promise<number> => {
  const redisData = await MainRedisClient.scard('global_matches');

  return redisData;
};

const isUserInQueue = async (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('poker_queue', `${userId}`)
    .then((result) => result !== 0)
    .catch((e) => {
      debugError(e);
      return false;
    });

const getUsersInQueue = (): Promise<string[]> => MainRedisClient.smembers('poker_queue');

const getTotalUsersInQueue = (): Promise<number> => MainRedisClient.scard('poker_queue');

const removeUsersFromQueue = async (...userId: BigString[]): Promise<void> => {
  await MainRedisClient.srem(
    'poker_queue',
    userId.map((a) => `${a}`),
  );
};

const addUserToQueue = async (userId: BigString): Promise<void> => {
  await MainRedisClient.sadd('poker_queue', `${userId}`);
};

export default {
  isUserInMatch,
  isUserInQueue,
  removeUsersFromQueue,
  addUserToQueue,
  getUsersInQueue,
  getTotalRunningGlobalMatches,
  addUsersInMatch,
  setMatchState,
  getTotalUsersInQueue,
  getTimer,
  deleteTimer,
  deleteMatchState,
  registerTimer,
  getMatchState,
  removeUsersInMatch,
  getTimerKeys,
};
