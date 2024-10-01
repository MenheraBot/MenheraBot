/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { bot } from '../..';
import pokerRepository from '../../database/repositories/pokerRepository';
import { getOrchestratorClient } from '../../structures/orchestratorConnection';
import { updateGameState } from './turnManager';
import { DeleteMatchTimer, PokerTimer, TimeoutFoldTimer, TimerActionType } from './types';
import { closeTable } from './matchManager';
import { getPlayerBySeat } from './playerControl';
import { executeAction } from './playerBet';
import GenericInteractionContext from '../../structures/command/GenericInteractionContext';

const timers = new Map<string, NodeJS.Timeout>();

const executeDeleteMatch = async (timer: DeleteMatchTimer) => {
  const gameData = await pokerRepository.getMatchState(timer.matchId);
  if (!gameData) return;

  if (gameData.inMatch) return;

  const ctx = new GenericInteractionContext(
    gameData.interactionToken,
    gameData.originalInteractionId,
    gameData.language,
  );

  closeTable(ctx, gameData);
};

const executeFoldTimeout = async (timer: TimeoutFoldTimer) => {
  const gameData = await pokerRepository.getMatchState(timer.matchId);
  if (!gameData) return;

  if (!gameData.inMatch) return;

  const player = getPlayerBySeat(gameData, gameData.seatToPlay);

  executeAction(gameData, player, 'FOLD');

  const ctx = new GenericInteractionContext(
    gameData.interactionToken,
    gameData.originalInteractionId,
    gameData.language,
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
