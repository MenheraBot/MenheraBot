/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { bot } from '../..';
import commandRepository from '../../database/repositories/commandRepository';
import pokerRepository from '../../database/repositories/pokerRepository';
import { getOrchestratorClient } from '../../structures/ipcConnections';
import { DatabaseCommandSchema } from '../../types/database';
import { updateGameState } from './turnManager';
import PokerFollowupInteractionContext from './PokerFollowupInteractionContext';
import { DeleteMatchTimer, PokerTimer, TimeoutFoldTimer, TimerActionType } from './types';
import { closeTable } from './matchManager';
import { getPlayerBySeat } from './playerControl';

const timers = new Map<string, NodeJS.Timeout>();

const executeDeleteMatch = async (timer: DeleteMatchTimer) => {
  const gameData = await pokerRepository.getMatchState(timer.matchId);
  if (!gameData) return;

  if (gameData.inMatch) return;

  const pokerCommandId = (await commandRepository.getCommandInfo('poker')) as DatabaseCommandSchema;

  const ctx = new PokerFollowupInteractionContext(
    gameData.interactionToken,
    pokerCommandId.discordId,
  );

  closeTable(ctx, gameData);
};

const executeFoldTimeout = async (timer: TimeoutFoldTimer) => {
  const gameData = await pokerRepository.getMatchState(timer.matchId);
  if (!gameData) return;

  if (!gameData.inMatch) return;

  const player = getPlayerBySeat(gameData, gameData.seatToPlay);

  player.pot = 0;
  player.folded = true;

  gameData.lastAction = {
    action: 'FOLD',
    playerSeat: player.seatId,
    pot: gameData.lastAction.pot,
  };

  const pokerCommandId = (await commandRepository.getCommandInfo('poker')) as DatabaseCommandSchema;

  const ctx = new PokerFollowupInteractionContext(
    gameData.interactionToken,
    pokerCommandId.discordId,
  );

  return updateGameState(ctx, gameData);
};

const executeTimer = async (timerId: string, timer: PokerTimer): Promise<void> => {
  clearPokerTimer(timerId);

  switch (timer.type) {
    case TimerActionType.DELETE_GAME:
      return executeDeleteMatch(timer);
    case TimerActionType.TIMOEUT_FOLD:
      return executeFoldTimeout(timer);
  }
};

const setupTimers = async (): Promise<void> => {
  (await pokerRepository.getTimerKeys()).forEach(async (key) => {
    const timerId = key.replace('poker_timer:', '');
    const timerMetadata = await pokerRepository.getTimer(timerId);

    if (Date.now() >= timerMetadata.executeAt) return executeTimer(timerId, timerMetadata);
    startPokerTimeout(timerId, timerMetadata);
  });
};

const startPokerTimeout = (timerId: string, timerMetadata: PokerTimer): void => {
  if (!bot.isMaster) {
    getOrchestratorClient().send({
      type: 'BE_MERCURY',
      action: 'SET_TIMER',
      timerId,
      timerMetadata,
    });
    return;
  }

  pokerRepository.registerTimer(timerId, timerMetadata);

  const timeout = setTimeout(() => {
    executeTimer(timerId, timerMetadata);
  }, timerMetadata.executeAt - Date.now()).unref();

  timers.set(timerId, timeout);
};

const clearPokerTimer = (timerId: string): void => {
  if (!bot.isMaster) {
    getOrchestratorClient().send({ type: 'BE_MERCURY', action: 'CLEAR_TIMER', timerId });
    return;
  }

  pokerRepository.deleteTimer(timerId);

  const timer = timers.get(timerId);
  if (!timer) return;

  clearTimeout(timer);
  timers.delete(timerId);
};

export { clearPokerTimer, startPokerTimeout, setupTimers };
