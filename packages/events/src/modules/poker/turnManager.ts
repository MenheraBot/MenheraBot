/* eslint-disable @typescript-eslint/no-non-null-assertion */
import pokerRepository from '../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

import { clearFoldTimeout, createTableMessage, finishRound, makeShowdown } from './matchManager';
import { PokerMatch } from './types';

import PokerFollowupInteractionContext from './PokerFollowupInteractionContext';
import { MAX_POKER_PLAYERS } from './constants';
import { getPlayerBySeat } from './playerControl';
import { mentionUser } from '../../utils/discord/userUtils';

const getNextPlayableSeat = (gameData: PokerMatch, lastSeat: number): number => {
  const biggestPlayableSeat = gameData.players.reduce((p, c) => {
    if (c.seatId > p && !c.folded && c.chips > 0) return c.seatId;
    return p;
  }, 0);

  if (lastSeat >= biggestPlayableSeat)
    for (let i = 0; i < MAX_POKER_PLAYERS; i++) {
      const player = getPlayerBySeat(gameData, i);
      if (player && !player.folded && player.chips > 0) return player.seatId;
    }

  const nextPlayer = getPlayerBySeat(gameData, lastSeat + 1);
  if (!nextPlayer || nextPlayer.folded || nextPlayer.chips === 0)
    return getNextPlayableSeat(gameData, lastSeat + 1);

  return nextPlayer.seatId;
};

const getPreviousPlayableSeat = (gameData: PokerMatch, lastSeat: number): number => {
  const lowestPlayableSeat = gameData.players.reduce((p, c) => {
    if (c.seatId < p && !c.folded && c.chips > 0) return c.seatId;
    return p;
  }, MAX_POKER_PLAYERS);

  if (lastSeat <= lowestPlayableSeat)
    for (let i = MAX_POKER_PLAYERS; i > 0; i--) {
      const player = getPlayerBySeat(gameData, i);
      if (player && !player.folded && player.chips > 0) return player.seatId;
    }

  const previousPlayer = getPlayerBySeat(gameData, lastSeat - 1);
  if (!previousPlayer || previousPlayer.folded || previousPlayer.chips === 0)
    return getPreviousPlayableSeat(gameData, lastSeat - 1);

  return previousPlayer.seatId;
};

const changeStage = (gameData: PokerMatch): void => {
  const stages: { [x: string]: PokerMatch['stage'] } = {
    preflop: 'flop',
    flop: 'turn',
    turn: 'river',
    river: 'showdown',
  };
  gameData.raises = 0;

  gameData.stage = stages[gameData.stage];
};

const updatePlayerTurn = (gameData: PokerMatch): void => {
  const nextPlayerSeatId = getNextPlayableSeat(gameData, gameData.lastAction.playerSeat);

  const lastPlayer = getPlayerBySeat(gameData, gameData.lastAction.playerSeat);
  const nextPlayer = getPlayerBySeat(gameData, nextPlayerSeatId);

  if (lastPlayer.seatId === gameData.lastPlayerSeat && gameData.lastAction.pot === nextPlayer.pot) {
    gameData.seatToPlay = getNextPlayableSeat(gameData, gameData.dealerSeat);
    gameData.lastPlayerSeat = getNextPlayableSeat(gameData, gameData.dealerSeat - 1);

    changeStage(gameData);
    return;
  }

  gameData.seatToPlay = nextPlayer.seatId;
};

const updateGameState = async (
  ctx: ComponentInteractionContext | PokerFollowupInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  const playedUserId = gameData.players.find((a) => a.seatId === gameData.seatToPlay)!.id;
  clearFoldTimeout(playedUserId);

  const playingPlayers = gameData.players.filter((a) => !a.folded);

  if (playingPlayers.length === 1)
    return finishRound(ctx, gameData, [gameData.players.find((a) => !a.folded)!], 'FOLDED');

  const canBet = playingPlayers.filter((a) => a.chips > 0);

  if (canBet.length <= 1 && gameData.lastAction.playerSeat === gameData.lastPlayerSeat)
    return makeShowdown(ctx, gameData);

  updatePlayerTurn(gameData);

  if (gameData.stage === 'showdown') return makeShowdown(ctx, gameData);

  await pokerRepository.setMatchState(gameData.matchId, gameData);
  await createTableMessage(
    ctx,
    gameData,
    ctx.locale(`commands:poker.made-actions.${gameData.lastAction.action}`, {
      user: mentionUser(playedUserId),
      chips: gameData.lastAction.action === 'BET' ? gameData.blind : gameData.lastAction.pot,
    }),
  );
};

export { updateGameState, getNextPlayableSeat, updatePlayerTurn, getPreviousPlayableSeat };
