import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases.js';
import commandRepository from './commandRepository.js';
import starsRepository from './starsRepository.js';

export type RockPaperScissorsSelection = 'ROCK' | 'PAPER' | 'SCISSORS';

const getMatchKey = (matchId: BigString) => `ppt:${matchId}`;

const setupGame = async (matchId: BigString, betValue: number): Promise<void> => {
  const key = getMatchKey(matchId);
  await MainRedisClient.hset(key, { betValue });
  const expireTime = await commandRepository.getInteractionExpiration(matchId);
  await MainRedisClient.expire(key, Math.max(expireTime - 10, 1));
};

const registerSelection = async (
  matchId: BigString,
  userId: BigString,
  selected: RockPaperScissorsSelection,
): Promise<void> => {
  const key = getMatchKey(matchId);
  await MainRedisClient.hset(key, { [`${userId}`]: selected });
};

export type RockPaperScissorsGame = Record<string, RockPaperScissorsSelection>;

const getMatchData = async (matchId: BigString): Promise<RockPaperScissorsGame> => {
  const key = getMatchKey(matchId);
  return MainRedisClient.hgetall(key) as Promise<Record<string, RockPaperScissorsSelection>>;
};

const deleteMatch = async (matchId: BigString): Promise<void> => {
  const key = getMatchKey(matchId);
  await MainRedisClient.del(key);
};

const applyBets = async (winnerId: BigString, loserId: BigString, value: number): Promise<void> => {
  await Promise.all([
    starsRepository.removeStars(loserId, value),
    starsRepository.addStars(winnerId, value),
  ]);
};

export default { setupGame, registerSelection, getMatchData, deleteMatch, applyBets };
