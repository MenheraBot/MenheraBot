import { bot } from '../..';
import pokerRepository from '../../database/repositories/pokerRepository';
import { getOrchestratorClient } from '../../structures/ipcConnections';
import { cleanupGame } from './handleGameAction';
import { DeleteMatchTimer, PokerTimer, TimerActionType } from './types';

const timers = new Map<string, NodeJS.Timeout>();

const executeDeleteMatch = async (timer: DeleteMatchTimer) => {
  const match = await pokerRepository.getMatchState(timer.matchId);
  if (!match) return;

  if (match.inMatch) return;

  cleanupGame(match);
};

const executeTimer = async (timerId: string, timer: PokerTimer): Promise<void> => {
  clearTimer(timerId);

  switch (timer.type) {
    case TimerActionType.DELETE_GAME:
      return executeDeleteMatch(timer);
  }
};

const setupTimers = async (): Promise<void> => {
  (await pokerRepository.getTimerKeys()).forEach(async (key) => {
    const timerId = key.split(':')[1];
    const timerMetadata = await pokerRepository.getTimer(timerId);

    if (Date.now() >= timerMetadata.executeAt) return executeTimer(timerId, timerMetadata);
    startPokerTimeout(timerId, timerMetadata);
  });
};

const startPokerTimeout = (timerId: string, timerMetadata: PokerTimer): void => {
  if (!bot.isMaster) {
    getOrchestratorClient().send({ type: 'BE_MERCURY', timerId, timerMetadata });
    return;
  }

  pokerRepository.registerTimer(timerId, timerMetadata);

  const timeout = setTimeout(() => {
    executeTimer(timerId, timerMetadata);
  }, Date.now() - timerMetadata.executeAt).unref();

  timers.set(timerId, timeout);
};

const clearTimer = (timerId: string): void => {
  pokerRepository.deleteTimer(timerId);

  const timer = timers.get(timerId);
  if (!timer) return;

  clearTimeout(timer);
  timers.delete(timerId);
};

export { clearTimer, startPokerTimeout, setupTimers };
