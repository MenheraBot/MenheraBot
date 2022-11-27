import { BigString } from 'discordeno/types';
import bichoRepository from '../../database/repositories/bichoRepository';
import { postBichoResults } from '../../utils/apiRequests/statistics';
import starsRepository from '../../database/repositories/starsRepository';
import { BichoGameInfo } from './types';
import { makePlayerResults } from './finishBets';

const GAME_DURATION = 1000 * 60 * 60 * 6;

const generateResults = (): number[] => {
  const results = [];

  for (let i = 0; i < 4; i++) results.push(Math.floor(Math.random() * 10));

  return results;
};

const finishGame = async (): Promise<void> => {
  const results = [
    generateResults(),
    generateResults(),
    generateResults(),
    generateResults(),
    generateResults(),
  ];

  const playerBets = await bichoRepository.getAllUserBets();

  const players = makePlayerResults(playerBets, results);

  postBichoResults(players);

  let biggestProfit = 0;

  players.forEach((a) => {
    if (a.didWin) {
      starsRepository.addStars(a.id, a.profit);
      if (a.profit > biggestProfit) biggestProfit = a.profit;
    }
  });

  await bichoRepository.setLastGameInfo(Date.now(), results, biggestProfit);
  await bichoRepository.resetAllCurrentBichoStats();
  await startGameLoop();
};

const didUserAlreadyBet = async (userId: BigString): Promise<boolean> =>
  bichoRepository.didUserAlreadyBet(userId);

const canRegisterBet = async (userId: BigString): Promise<boolean> => {
  const [dueDate, haveBet] = await Promise.all([
    bichoRepository.getCurrentGameDueDate(),
    didUserAlreadyBet(userId),
  ]);

  if (dueDate < Date.now()) return false;
  if (haveBet) return false;

  return true;
};

const registerUserBet = async (
  userId: BigString,
  betValue: number,
  optionSelected: string,
): Promise<void> => {
  await bichoRepository.addUserBet(userId, betValue, optionSelected);
  await bichoRepository.incrementBetAmount(betValue);
};

const startGameLoop = async (): Promise<void> => {
  let hasDueDate = await bichoRepository.getCurrentGameDueDate();

  if (hasDueDate < Date.now()) {
    const pendingAwards = await bichoRepository.getCurrentGameBetsMade();

    if (pendingAwards > 0) return finishGame();
    hasDueDate = Date.now() + GAME_DURATION;
    bichoRepository.setCurrentGameDueDate(hasDueDate);
  }

  setTimeout(finishGame, hasDueDate - Date.now()).unref();
};

const getLastGameStatus = async (): Promise<BichoGameInfo | null> =>
  bichoRepository.getLastGameInfo();

const getCurrentGameStatus = async (): Promise<{ dueDate: number; betsOn: number }> => {
  const [dueDate, betsOn] = await Promise.all([
    bichoRepository.getCurrentGameDueDate(),
    bichoRepository.getCurrentBichoBetAmount(),
  ]);

  return { dueDate, betsOn };
};

export {
  canRegisterBet,
  finishGame,
  registerUserBet,
  getLastGameStatus,
  getCurrentGameStatus,
  didUserAlreadyBet,
  startGameLoop,
};
