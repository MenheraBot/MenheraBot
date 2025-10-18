import { BigString } from '@discordeno/bot';
import { MainRedisClient } from '../databases.js';
import { PokerMatch, PokerTimer } from '../../modules/poker/types.js';

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

export default {
  isUserInMatch,
  addUsersInMatch,
  setMatchState,
  getTimer,
  deleteTimer,
  deleteMatchState,
  registerTimer,
  getMatchState,
  removeUsersInMatch,
  getTimerKeys,
};
