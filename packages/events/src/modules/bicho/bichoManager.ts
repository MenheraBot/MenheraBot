import { logger } from '../../utils/logger';
import { BichoGame } from './types';
import { makePlayerResults } from './finishBets';

const GAME_DURATION = 1000 * 60 * 60 * 5;

let gameLoop: NodeJS.Timer;

const createGame = (): BichoGame => ({
  dueDate: Date.now() + GAME_DURATION,
  bets: [],
  results: [],
  biggestProfit: 0,
});

let onGoingGame: BichoGame;
let lastGame: BichoGame;

const getResults = (): number[] => {
  const results = [];

  for (let i = 0; i < 4; i++) results.push(Math.floor(Math.random() * 10));

  return results;
};

const finishGame = (): void => {
  const results = [getResults(), getResults(), getResults(), getResults(), getResults()];
  onGoingGame.results = results;

  lastGame = onGoingGame;
  onGoingGame = createGame();

  const players = makePlayerResults(lastGame);

  // httprequiest.postBichoGame(players)

  players.forEach((a) => {
    if (a.didWin) {
      // this.clientInstance.repositories.starRepository.add(a.id, a.profit);
      if (lastGame && a.profit > lastGame.biggestProfit) lastGame.biggestProfit = a.profit;
    }
  });
};

const canRegisterBet = (userId: string): boolean => {
  if (onGoingGame.dueDate < Date.now()) return false;
  if (onGoingGame.bets.some((plr) => plr.id === userId)) return false;
  return true;
};

const registerUserBet = (userId: string, betValue: number, optionSelected: string): void => {
  onGoingGame.bets.push({ id: userId, bet: betValue, option: optionSelected });
};

const getLastGameStatus = (): BichoGame => lastGame;
const getCurrentGameStatus = (): BichoGame => onGoingGame;

const stopGame = async (): Promise<void> => {
  clearInterval(gameLoop);

  const totalBets = [...onGoingGame.bets.keys()].length;

  await new Promise<void>((resolve) => {
    if (totalBets <= 0) resolve();
    onGoingGame.bets.forEach((user) => {
      logger.debug(user);
      /*  this.clientInstance.repositories.starRepository.add(a.id, a.bet).then(() => {
        totalBets -= 1;
        if (totalBets <= 0) resolve();
      }); */
    });
  });

  onGoingGame = createGame();
  onGoingGame.dueDate = 0;
};

const startGame = (): void => {
  onGoingGame = createGame();
  gameLoop = setInterval(finishGame, GAME_DURATION);
};

export {
  canRegisterBet,
  finishGame,
  registerUserBet,
  getLastGameStatus,
  getCurrentGameStatus,
  stopGame,
  startGame,
};