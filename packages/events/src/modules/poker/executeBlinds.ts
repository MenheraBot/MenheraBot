/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { executeAction } from './playerBet';
import { getPlayerBySeat } from './playerControl';
import { getNextPlayableSeat } from './turnManager';
import { PokerMatch } from './types';

const executeBlinds = (gameData: PokerMatch): void => {
  const headsUp = gameData.players.length === 2;
  const { blind } = gameData;
  const halfBlind = Math.floor(blind / 2);

  if (headsUp) {
    const dealerIndex = gameData.players.findIndex((a) => a.seatId === gameData.dealerSeat);
    const dealer = gameData.players[dealerIndex];
    const bigBlind = gameData.players[Number(!dealerIndex)];

    executeAction(gameData, dealer, 'BET', halfBlind);
    executeAction(gameData, bigBlind, 'BET', blind);

    gameData.seatToPlay = dealer.seatId;
    gameData.lastPlayerSeat = bigBlind.seatId;
    return;
  }

  const smallBlindSeat = getNextPlayableSeat(gameData, gameData.dealerSeat);
  const bigBlindSeat = getNextPlayableSeat(gameData, smallBlindSeat);

  const smallBlind = getPlayerBySeat(gameData, smallBlindSeat);
  const bigBlind = getPlayerBySeat(gameData, bigBlindSeat);

  executeAction(gameData, smallBlind, 'BET', halfBlind);
  executeAction(gameData, bigBlind, 'BET', blind);

  gameData.seatToPlay = getNextPlayableSeat(gameData, bigBlindSeat);
  gameData.lastPlayerSeat = bigBlindSeat;
};

export { executeBlinds };
