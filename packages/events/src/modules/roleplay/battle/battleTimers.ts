import { getFixedT } from 'i18next';
import battleRepository from '../../../database/repositories/battleRepository';
import { bot } from '../../..';
import { getOrchestratorClient } from '../../../structures/orchestratorConnection';
import { BattleTimer, BattleTimerActionType } from '../types';
import { executeEnemyAttack } from './executeEnemyAttack';
import commandRepository from '../../../database/repositories/commandRepository';
import { DatabaseCommandSchema } from '../../../types/database';
import FollowUpInteractionContext from '../../../structures/command/FollowUpInteractionContext';
import { updateBattleMessage } from './executeUserChoice';
import { userWasKilled } from './battleUtils';
import { logger } from '../../../utils/logger';

const timers = new Map<string, NodeJS.Timeout>();

const executeForceFinish = async (timer: BattleTimer) => {
  const battleData = await battleRepository.getAdventure(timer.battleId);
  if (!battleData) return;

  const adventureCommandId = (await commandRepository.getCommandInfo(
    'aventura',
  )) as DatabaseCommandSchema;

  const ctx = new FollowUpInteractionContext(
    battleData.interactionToken,
    adventureCommandId.discordId,
    getFixedT(battleData.language),
  );

  battleData.user.life = 0;
  userWasKilled(ctx, battleData);
};

const executeTimeoutChoice = async (timer: BattleTimer) => {
  const battleData = await battleRepository.getAdventure(timer.battleId);
  if (!battleData) return;

  executeEnemyAttack(battleData);

  const adventureCommandId = (await commandRepository.getCommandInfo(
    'aventura',
  )) as DatabaseCommandSchema;

  const ctx = new FollowUpInteractionContext(
    battleData.interactionToken,
    adventureCommandId.discordId,
    getFixedT(battleData.language),
  );

  updateBattleMessage(ctx, battleData);
};

const executeTimer = async (timerId: string, timer: BattleTimer): Promise<void> => {
  clearBattleTimer(timerId);

  switch (timer.type) {
    case BattleTimerActionType.FORCE_FINISH_BATTLE:
      return executeForceFinish(timer);
    case BattleTimerActionType.TIMEOUT_CHOICE:
      return executeTimeoutChoice(timer);
  }
};

const setupBattleTimers = async (): Promise<void> => {
  (await battleRepository.getTimerKeys()).forEach(async (key) => {
    const timerId = key.replace('battle_timer:', '');
    const timerMetadata = await battleRepository.getTimer(timerId);

    logger.debug(Date.now() - timerMetadata.executeAt);

    if (!timerMetadata) return;

    if (Date.now() >= timerMetadata.executeAt) return executeTimer(timerId, timerMetadata);

    startBattleTimer(timerId, timerMetadata);
  });
};

const startBattleTimer = (timerId: string, timerMetadata: BattleTimer): void => {
  if (!bot.isMaster) {
    getOrchestratorClient().send({
      type: 'BE_MERCURY',
      action: 'BATTLE:SET_TIMER',
      timerId,
      timerMetadata,
    });
    return;
  }

  battleRepository.registerTimer(timerId, timerMetadata);

  const timeout = setTimeout(() => {
    executeTimer(timerId, timerMetadata);
  }, timerMetadata.executeAt - Date.now()).unref();

  timers.set(timerId, timeout);
};

const clearBattleTimer = (timerId: string): void => {
  if (!bot.isMaster) {
    getOrchestratorClient().send({ type: 'BE_MERCURY', action: 'BATTLE:CLEAR_TIMER', timerId });
    return;
  }

  battleRepository.deleteTimer(timerId);

  const timer = timers.get(timerId);
  if (!timer) return;

  clearTimeout(timer);
  timers.delete(timerId);
};

export { clearBattleTimer, startBattleTimer, setupBattleTimers };
