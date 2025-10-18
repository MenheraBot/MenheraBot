import { BigString } from '@discordeno/bot';
import { BetPlayer, BichoGameInfo } from '../../modules/bicho/types.js';
import { MainRedisClient } from '../databases.js';

const getLastGameInfo = async (): Promise<BichoGameInfo | null> => {
  const fromRedis = await MainRedisClient.get('last_bicho');

  if (fromRedis) return JSON.parse(fromRedis);

  return null;
};

const setLastGameInfo = async (
  dueDate: number,
  results: number[][],
  biggestProfit: number,
): Promise<void> => {
  await MainRedisClient.set('last_bicho', JSON.stringify({ dueDate, results, biggestProfit }));
};

const didUserAlreadyBet = async (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('current_bicho_bet_ids', `${userId}`).then((res) => res === 1);

const getCurrentGameDueDate = async (): Promise<number> => {
  const fromRedis = await MainRedisClient.get('current_bicho');

  if (fromRedis) return Number(fromRedis);

  return -1;
};

const setCurrentGameDueDate = async (dueDate: number): Promise<void> => {
  await MainRedisClient.set('current_bicho', dueDate);
};

const addUserBet = async (
  userId: BigString,
  betValue: number,
  optionSelected: string,
): Promise<void> => {
  await MainRedisClient.sadd(
    'current_bicho_bets',
    JSON.stringify({ id: `${userId}`, bet: betValue, option: optionSelected }),
  );

  await MainRedisClient.sadd('current_bicho_bet_ids', `${userId}`);
};

const resetAllCurrentBichoStats = async (): Promise<void> => {
  await MainRedisClient.del('current_bicho_bet_ids');
  await MainRedisClient.del('current_bicho');
  await MainRedisClient.del('current_bicho_bets');
  await MainRedisClient.del('current_bicho_bet_amount');
};

const getAllUserBets = async (): Promise<BetPlayer[]> => {
  const fromRedis = await MainRedisClient.smembers('current_bicho_bets');

  return fromRedis.map((a) => JSON.parse(a));
};

const incrementBetAmount = async (bet: number): Promise<void> => {
  await MainRedisClient.incrby('current_bicho_bet_amount', bet);
};

const getCurrentBichoBetAmount = async (): Promise<number> => {
  const fromRedis = await MainRedisClient.get('current_bicho_bet_amount');

  if (fromRedis) return Number(fromRedis);

  return 0;
};

const getCurrentGameBetsMade = async (): Promise<number> =>
  MainRedisClient.scard('current_bicho_bet_ids');

export default {
  getLastGameInfo,
  didUserAlreadyBet,
  getAllUserBets,
  getCurrentBichoBetAmount,
  getCurrentGameDueDate,
  incrementBetAmount,
  addUserBet,
  getCurrentGameBetsMade,
  setCurrentGameDueDate,
  resetAllCurrentBichoStats,
  setLastGameInfo,
};
