import { BigString } from 'discordeno/types';
import {
  ApiGamblingGameCompatible,
  ApiGamblingGameStats,
  ApiHuntStats,
  ApiUserProfileStats,
  MayReturnError,
} from '../../types/api';
import { BichoWinner } from '../../modules/bicho/types';
import { ApiHuntingTypes } from '../../modules/hunt/types';
import { debugError } from '../debugError';
import { dataRequest } from './apiRequests';

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

const postBichoResults = async (players: BichoWinner[]): Promise<void> => {
  await dataRequest.post('/statistics/bicho', { players }).catch(debugError);
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

const getUserProfileInfo = async (userId: BigString): Promise<false | ApiUserProfileStats> => {
  const res = await dataRequest
    .get('/usages/user', { data: { userId: `${userId}` } })
    .catch(() => null);

  if (!res) return false;

  if (res.status === 200) return res.data;

  return false;
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

export {
  postHuntExecution,
  postBichoResults,
  postCoinflipMatch,
  getGamblingGameStats,
  postRoulleteGame,
  postBlackjackGame,
  getUserHuntStats,
  getUserProfileInfo,
};
