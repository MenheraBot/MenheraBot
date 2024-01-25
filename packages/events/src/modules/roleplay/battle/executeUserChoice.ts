import battleRepository from '../../../database/repositories/battleRepository';
import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../../types/interaction';
import { GenericContext } from '../../../types/menhera';
import { MessageFlags } from '../../../utils/discord/messageUtils';
import { SECONDS_TO_CHOICE_ACTION_IN_BATTLE } from '../constants';
import { getAbility } from '../data/abilities';
import { BattleTimerActionType, PlayerVsEnviroment } from '../types';
import { clearBattleTimer, startBattleTimer } from './battleTimers';
import { checkDeath, enemyWasKilled, keepNumbersPositive, userWasKilled } from './battleUtils';
import { displayBattleControlMessage } from './displayBattleState';
import { applyAbilityEffects, executeEntitiesEffects } from './executeEffects';
import { executeEnemyAttack } from './executeEnemyAttack';

const updateBattleMessage = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  keepNumbersPositive(adventure.user);
  keepNumbersPositive(adventure.enemy);

  if (checkDeath(adventure.enemy)) return enemyWasKilled(ctx, adventure);
  if (checkDeath(adventure.user)) return userWasKilled(ctx, adventure);

  startBattleTimer(`battle_timeout:${adventure.id}`, {
    battleId: adventure.id,
    executeAt: Date.now() + SECONDS_TO_CHOICE_ACTION_IN_BATTLE * 1000,
    type: BattleTimerActionType.TIMEOUT_CHOICE,
  });

  await battleRepository.setAdventure(adventure.id, adventure);

  displayBattleControlMessage(ctx, adventure);
};

const executeUserChoice = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  const [choiceStringedId] = ctx.interaction.data.values;

  const selectedAbility = getAbility(Number(choiceStringedId));

  if (selectedAbility.energyCost > adventure.user.energy)
    return ctx.respondInteraction({
      content: 'Não tem energia para usar',
      flags: MessageFlags.EPHEMERAL,
    });

  adventure.user.energy -= selectedAbility.energyCost;

  clearBattleTimer(`battle_timeout:${adventure.id}`);

  executeEntitiesEffects(ctx, adventure);

  applyAbilityEffects(ctx, adventure, selectedAbility.effects);

  executeEnemyAttack(adventure);

  updateBattleMessage(ctx, adventure);
};

export { executeUserChoice, updateBattleMessage };
