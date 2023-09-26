import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';
import { PokerMatch } from '../../modules/poker/types';

const isUserInMatch = async (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('poker_match', `${userId}`).then((r) => r === 1);

const addUsersInMatch = async (userIds: string[]): Promise<void> => {
  await MainRedisClient.sadd('poker_match', userIds);
};

const removeUsersInMatch = async (userIds: string[]): Promise<void> => {
  await MainRedisClient.srem(`poker_match`, userIds);
};

const setPokerMatchState = async (matchId: BigString, matchData: PokerMatch): Promise<void> => {
  await MainRedisClient.set(`poker_table:${matchId}`, JSON.stringify(matchData));
};

const deletePokerMatchState = async (matchId: BigString): Promise<void> => {
  await MainRedisClient.del(`poker_table:${matchId}`);
};

const getPokerMatchState = async (matchId: BigString): Promise<null | PokerMatch> => {
  const redisData = await MainRedisClient.get(`poker_table:${matchId}`);

  if (!redisData) return null;

  return JSON.parse(redisData);
};

export default {
  isUserInMatch,
  addUsersInMatch,
  setPokerMatchState,
  deletePokerMatchState,
  getPokerMatchState,
  removeUsersInMatch,
};
