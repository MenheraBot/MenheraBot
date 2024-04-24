/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getFixedT } from 'i18next';
import { bot } from '../..';
import commandRepository from '../../database/repositories/commandRepository';
import pokerRepository from '../../database/repositories/pokerRepository';
import { getOrchestratorClient } from '../../structures/orchestratorConnection';
import { DatabaseCommandSchema } from '../../types/database';
import { updateGameState } from './turnManager';
import PokerFollowupInteractionContext from './PokerFollowupInteractionContext';
import {
  DeleteMatchTimer,
  ExitGlobalMatchQueueTimer,
  PokerTimer,
  TimeoutFoldTimer,
  TimerActionType,
} from './types';
import { closeTable } from './matchManager';
import { getPlayerBySeat } from './playerControl';
import { executeAction } from './playerBet';
import { MessageFlags } from '../../utils/discord/messageUtils';

const timers = new Map<string, NodeJS.Timeout>();

const createContext = async (
  interactionToken: string,
  userLanguage: string,
): Promise<PokerFollowupInteractionContext> => {
  const pokerCommandId = (await commandRepository.getCommandInfo('poker')) as DatabaseCommandSchema;
  return new PokerFollowupInteractionContext(
    interactionToken,
    pokerCommandId.discordId,
    getFixedT(userLanguage),
  );
};

const executeDeleteMatch = async (timer: DeleteMatchTimer) => {
  const gameData = await pokerRepository.getMatchState(timer.matchId);
  if (!gameData) return;

  if (gameData.inMatch) return;

  const ctx = await createContext(gameData.interactionToken, gameData.language);

  closeTable(ctx, gameData);
};

const executeFoldTimeout = async (timer: TimeoutFoldTimer) => {
  const gameData = await pokerRepository.getMatchState(timer.matchId);
  if (!gameData) return;

  if (!gameData.inMatch) return;

  const player = getPlayerBySeat(gameData, gameData.seatToPlay);

  executeAction(gameData, player, 'FOLD');

  const ctx = await createContext(gameData.interactionToken, gameData.language);

  return updateGameState(ctx, gameData);
};

const executeExitGlobalMatchQueue = async (timer: ExitGlobalMatchQueueTimer) => {
  const ctx = await createContext(timer.interactionToken, timer.userLanguage);

  await pokerRepository.removeUserFromQueue(timer.userId);

  ctx.followUp({
    content: ctx.prettyResponse('error', 'commands:poker.queue.exit_timeout'),
    flags: MessageFlags.EPHEMERAL,
  });
};

const executeTimer = async (timerId: string, timer: PokerTimer): Promise<void> => {
  clearPokerTimer(timerId);

  switch (timer.type) {
    case TimerActionType.DELETE_GAME:
      return executeDeleteMatch(timer);
    case TimerActionType.TIMOEUT_FOLD:
      return executeFoldTimeout(timer);
    case TimerActionType.EXIT_GLOBAL_QUEUE:
      return executeExitGlobalMatchQueue(timer);
    default: // @ts-expect-error yes i know, it just for ensure that future versions dont mistake this
      throw new Error(`There is no handler configured to execute timer type ${timer?.type}`);
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
