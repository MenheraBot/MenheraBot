import { BigString } from 'discordeno/types';
import { BetPlayer, BichoGameInfo } from '../../modules/bicho/types';
import { RedisClient } from '../databases';

const getLastGameInfo = async (): Promise<BichoGameInfo | null> => {
  const fromRedis = await RedisClient.get('last_bicho');

  if (fromRedis) return JSON.parse(fromRedis);

  return null;
};

const setLastGameInfo = async (
  dueDate: number,
  results: number[][],
  biggestProfit: number,
): Promise<void> => {
  await RedisClient.set('last_bicho', JSON.stringify({ dueDate, results, biggestProfit }));
};

const didUserAlreadyBet = async (userId: BigString): Promise<boolean> =>
  RedisClient.sismember('current_bicho_bet_ids', `${userId}`).then((res) => res === 1);

const getCurrentGameDueDate = async (): Promise<number> => {
  const fromRedis = await RedisClient.get('current_bicho');

  if (fromRedis) return Number(fromRedis);

  return -1;
};

const setCurrentGameDueDate = async (dueDate: number): Promise<void> => {
  await RedisClient.set('current_bicho', dueDate);
};

const addUserBet = async (
  userId: BigString,
  betValue: number,
  optionSelected: string,
): Promise<void> => {
  await RedisClient.sadd(
    'current_bicho_bets',
    JSON.stringify({ id: `${userId}`, bet: betValue, option: optionSelected }),
  );

  await RedisClient.sadd('current_bicho_bet_ids', `${userId}`);
};

const resetAllCurrentBichoStats = async (): Promise<void> => {
  await RedisClient.del('current_bicho_bet_ids');
  await RedisClient.del('current_bicho');
  await RedisClient.del('current_bicho_bets');
  await RedisClient.del('current_bicho_bet_amount');
};

const getAllUserBets = async (): Promise<BetPlayer[]> => {
  const fromRedis = await RedisClient.smembers('current_bicho_bets');

  return fromRedis.map((a) => JSON.parse(a));
};

const incrementBetAmount = async (bet: number): Promise<void> => {
  await RedisClient.incrby('current_bicho_bet_amount', bet);
};

const getCurrentBichoBetAmount = async (): Promise<number> => {
  const fromRedis = await RedisClient.get('current_bicho_bet_amount');

  if (fromRedis) return Number(fromRedis);

  return 0;
};

const getCurrentGameBetsMade = async (): Promise<number> =>
  RedisClient.scard('current_bicho_bet_ids');

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
