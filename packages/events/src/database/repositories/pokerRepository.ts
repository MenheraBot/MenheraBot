import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';
import { PokerMatch, PokerTimerAction } from '../../modules/poker/types';

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

const registerTimer = async (executeAt: number, executeAction: PokerTimerAction): Promise<void> => {
  await MainRedisClient.set(`poker_timer:${executeAt}`, JSON.stringify(executeAction));
};

const getTimer = async (key: string): Promise<PokerTimerAction> => {
  const timer = (await MainRedisClient.get(key)) as string;

  return JSON.parse(timer);
};

const deleteTimer = async (key: string): Promise<void> => {
  await MainRedisClient.del(key);
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
