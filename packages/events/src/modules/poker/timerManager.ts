import pokerRepository from '../../database/repositories/pokerRepository';
import { DeleteMatchTimer, TimerActionType } from './types';

let scrapTimer: NodeJS.Timeout;

const executeDeleteMatch = async (timer: DeleteMatchTimer) => {
  const match = await pokerRepository.getMatchState(timer.matchId);
  if (!match) return;

  await pokerRepository.removeUsersInMatch(match.players.map((a) => a.id));
  await pokerRepository.deleteMatchState(match.matchId);
};

const getExpiredTimers = async (): Promise<void> => {
  (await pokerRepository.getTimerKeys()).forEach(async (timerKey) => {
    const hasExpired = Date.now() > Number(timerKey.split(':')[1]);
    if (!hasExpired) return;

    const timer = await pokerRepository.getTimer(timerKey);
    await pokerRepository.deleteTimer(timerKey);

    switch (timer.type) {
      case TimerActionType.DELETE_GAME:
        return executeDeleteMatch(timer);
    }
  });
};

const startPokerTimer = (): void => {
  scrapTimer = setInterval(() => {
    getExpiredTimers();
  }, 1000 * 30).unref();
};

const stopPokerTimer = (): void => {
  clearInterval(scrapTimer);
};

export { startPokerTimer, stopPokerTimer };
