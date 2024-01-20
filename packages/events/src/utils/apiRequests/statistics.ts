/* eslint-disable camelcase */
import { BigString } from 'discordeno/types';
import {
  ApiGamblingGameCompatible,
  ApiGamblingGameStats,
  ApiHuntStats,
  ApiPokerUserStats,
  ApiTransactionReason,
  ApiUserProfileStats,
  BanInfo,
  MayReturnError,
  TopGamblingUser,
  TopHunters,
  TransactionRegister,
} from '../../types/api';
import { BichoWinner } from '../../modules/bicho/types';
import { ApiHuntingTypes } from '../../modules/hunt/types';
import { debugError } from '../debugError';
import { dataRequest } from './apiRequests';
import { logger } from '../logger';
import { PokerApiUser } from '../../modules/poker/types';
import { AvailablePlants } from '../../modules/fazendinha/types';

const postHuntExecution = async (
  userId: string,
  huntType: ApiHuntingTypes,
  { value, success, tries }: { value: number; success: number; tries: number },
  userTag: string,
): Promise<void> => {
  await dataRequest
    .post('/statistics/hunt', { userId, huntType, value, success, tries, userTag })
    .catch(debugError);
};

const postBichoResults = async (
  players: BichoWinner[],
  date: number,
  results: string,
): Promise<void> => {
  await dataRequest.post('/statistics/bicho', { players, date, results }).catch(debugError);
};

const postCoinflipMatch = async (
  winnerId: string,
  loserId: string,
  betValue: number,
): Promise<void> => {
  await dataRequest
    .post('/statistics/coinflip', { winnerId, loserId, betValue, date: Date.now() })
    .catch(debugError);
};

const postRoulleteGame = async (
  userId: string,
  betValue: number,
  betType: string,
  profit: number,
  didWin: boolean,
  selectedValues: string,
): Promise<void> => {
  await dataRequest
    .post('/statistics/roulette', { userId, betValue, profit, didWin, betType, selectedValues })
    .catch(debugError);
};

const postBlackjackGame = async (
  userId: string,
  didWin: boolean,
  betValue: number,
): Promise<void> => {
  await dataRequest.post('/statistics/blackjack', { userId, didWin, betValue }).catch(debugError);
};

const postPokerRound = async (players: PokerApiUser[]): Promise<void> => {
  await dataRequest.post('/statistics/poker', { players }).catch(debugError);
};

const getUserProfileInfo = async (userId: string): Promise<null | ApiUserProfileStats> => {
  const res = await dataRequest.get('/usages/user', { params: { userId } }).catch(() => null);

  if (!res) return null;

  return res.data;
};

const getUserHuntStats = async (userId: BigString): Promise<MayReturnError<ApiHuntStats>> => {
  const res = await dataRequest
    .get('/statistics/hunt', { data: { userId: `${userId}` } })
    .catch(() => null);

  if (!res) return { error: true };

  if (!res.data.error) return res.data;

  return { error: true };
};

const getGamblingGameStats = async (
  userId: BigString,
  game: ApiGamblingGameCompatible,
): Promise<MayReturnError<ApiGamblingGameStats>> => {
  const res = await dataRequest
    .get(`/statistics/${game}`, { data: { userId: `${userId}` } })
    .catch(() => null);

  if (!res) return { error: true };

  if (!res.data.error) return res.data;

  return { error: true };
};

const getPokerStats = async (userId: string): Promise<MayReturnError<ApiPokerUserStats>> => {
  const res = await dataRequest.get(`/statistics/poker`, { params: { userId } }).catch(() => null);

  if (!res) return { error: true };

  return res.data;
};

const getTopCommandsByUses = async (
  skip: number,
  userId?: string,
): Promise<null | { name: string; uses: number }[]> => {
  const res = await dataRequest
    .get('/usages/top/commands', { params: { skip, userId } })
    .catch(() => null);

  if (!res) return null;

  return res.data;
};

const getTopUsersByUses = async (
  skip: number,
  bannedUsers: string[],
  commandName?: string,
): Promise<{ id: string; uses: number; commandName: string }[] | null> => {
  const res = await dataRequest
    .get(`/usages/top/users`, { params: { commandName, skip }, data: { bannedUsers } })
    .catch(() => null);

  if (!res) return null;

  return res.data;
};

const getTopHunters = async <HuntType extends ApiHuntingTypes>(
  skip: number,
  bannedUsers: string[],
  huntType: ApiHuntingTypes,
  type: string,
): Promise<TopHunters<HuntType>[] | null> => {
  const res = await dataRequest
    .get('/statistics/hunt/top', { data: { skip, bannedUsers, type, huntType } })
    .catch(() => null);

  if (!res) return null;

  if (!res.data.error) return res.data;

  return null;
};

const getTopGamblingUsers = async (
  skip: number,
  bannedUsers: string[],
  type: 'wins' | 'money',
  game: ApiGamblingGameCompatible,
): Promise<TopGamblingUser[] | null> => {
  const res = await dataRequest
    .get(`/statistics/${game}/top`, { data: { skip, bannedUsers, type } })
    .catch(() => null);

  if (!res) return null;

  if (!res.data.error) return res.data;

  return null;
};

const getUserLastBanData = async (userId: BigString): Promise<string | null> => {
  const res = await dataRequest.get(`/usages/lastban/${userId}`).catch(() => null);

  if (!res) return null;

  return res.data;
};

const getAllUserBans = async (userId: BigString): Promise<BanInfo[]> => {
  const res = await dataRequest.get(`/usages/bans/${userId}`).catch(() => null);

  if (!res) return [];

  return res.data;
};

const postTransaction = async (
  authorId: TransactionRegister['authorId'],
  targetId: TransactionRegister['targetId'],
  amount: TransactionRegister['amount'],
  currencyType: TransactionRegister['currencyType'],
  reason: ApiTransactionReason,
): Promise<void> => {
  await dataRequest
    .post('/statistics/transaction', { authorId, targetId, amount, currencyType, reason })
    .catch(debugError);

  logger.debug(
    `TRANSACTION!! ${authorId} deu ${amount} ${currencyType} para ${targetId} por conta de ${reason}`,
  );
};

const getUserTransactions = async (
  users: string[],
  page: number,
  types: Readonly<ApiTransactionReason[]>,
  currency: string[],
): Promise<TransactionRegister[] | null> => {
  const result = await dataRequest
    .get(`/statistics/transaction`, {
      params: {
        page,
        users,
        types,
        currency,
      },
    })
    .catch(() => null);

  if (!result) return null;

  return result.data.map(
    (res: {
      author_id: TransactionRegister['authorId'];
      target_id: TransactionRegister['targetId'];
      amount: TransactionRegister['amount'];
      currency_type: TransactionRegister['currencyType'];
      reason: TransactionRegister['reason'];
      date: TransactionRegister['date'];
    }) => ({
      authorId: res.author_id,
      targetId: res.target_id,
      amount: res.amount,
      currencyType: res.currency_type,
      reason: res.reason,
      date: Number(res.date),
    }),
  );
};

const postFazendinhaAction = async (
  userId: string,
  plant: AvailablePlants,
  action: 'ROTTED' | 'HARVEST',
): Promise<void> => {
  await dataRequest.post('/statistics/fazendinha', { userId, plant, action }).catch(debugError);
};

const getFazendinhaStatistics = async (
  userId: BigString,
): Promise<null | { plant: AvailablePlants; rotted: number; harvest: number }[]> => {
  const result = await dataRequest.get(`/statistics/fazendinha?userId=${userId}`).catch(debugError);

  if (!result) return null;

  return result.data;
};

export {
  postHuntExecution,
  postBichoResults,
  getTopCommandsByUses,
  postCoinflipMatch,
  getPokerStats,
  getUserTransactions,
  getFazendinhaStatistics,
  getGamblingGameStats,
  getTopUsersByUses,
  postRoulleteGame,
  postBlackjackGame,
  postFazendinhaAction,
  getUserHuntStats,
  getUserProfileInfo,
  postPokerRound,
  getTopGamblingUsers,
  getUserLastBanData,
  getAllUserBans,
  postTransaction,
  getTopHunters,
};
