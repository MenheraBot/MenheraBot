/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { bot } from '../..';
import commandRepository from '../../database/repositories/commandRepository';
import pokerRepository from '../../database/repositories/pokerRepository';
import { getOrchestratorClient } from '../../structures/ipcConnections';
import { DatabaseCommandSchema } from '../../types/database';
import { closeTable, updateGameState } from './handleGameAction';
import PokerFollowupInteractionContext from './PokerFollowupInteractionContext';
import { DeleteMatchTimer, PokerTimer, TimeoutFoldTimer, TimerActionType } from './types';

const timers = new Map<string, NodeJS.Timeout>();

const executeDeleteMatch = async (timer: DeleteMatchTimer) => {
  const match = await pokerRepository.getMatchState(timer.matchId);
  if (!match) return;

  if (match.inMatch) return;

  const pokerCommandId = (await commandRepository.getCommandInfo('poker')) as DatabaseCommandSchema;

  const ctx = new PokerFollowupInteractionContext(match.interactionToken, pokerCommandId.discordId);

  closeTable(ctx, match);
};

const executeFoldTimeout = async (timer: TimeoutFoldTimer) => {
  const match = await pokerRepository.getMatchState(timer.matchId);
  if (!match) return;

  if (!match.inMatch) return;

  const player = match.players.find((a) => a.seatId === match.seatToPlay)!;

  player.pot = 0;
  player.folded = true;

  match.lastAction = {
    action: 'FOLD',
    playerSeat: player.seatId,
    pot: match.lastAction.pot,
  };

  const pokerCommandId = (await commandRepository.getCommandInfo('poker')) as DatabaseCommandSchema;

  const ctx = new PokerFollowupInteractionContext(match.interactionToken, pokerCommandId.discordId);

  return updateGameState(ctx, match);
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
