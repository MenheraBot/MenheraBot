import battleRepository from '../../../database/repositories/battleRepository';
import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../../types/interaction';
import { GenericContext } from '../../../types/menhera';
import { MessageFlags } from '../../../utils/discord/messageUtils';
import { randomFromArray } from '../../../utils/miscUtils';
import { finishAdventure } from '../adventureManager';
import { SECONDS_TO_CHOICE_ACTION_IN_BATTLE } from '../constants';
import { getAbility } from '../data/abilities';
import { Enemies } from '../data/enemies';
import { Items } from '../data/items';
import inventoryManager from '../inventoryManager';
import { BattleTimerActionType, PlayerVsEnviroment } from '../types';
import { clearBattleTimer, startBattleTimer } from './battleTimers';
import { checkDeath, userWasKilled } from './battleUtils';
import { displayBattleControlMessage } from './displayBattleState';
import { executeEffects } from './executeEffects';
import { executeEnemyAttack } from './executeEnemyAttack';

const updateBattleMessage = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
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

  clearBattleTimer(`battle_timeout:${adventure.id}`);

  adventure.user.energy -= selectedAbility.energyCost;

  executeEffects(ctx, adventure, selectedAbility.effects);

  if (checkDeath(adventure.enemy)) {
    const dropedItem = randomFromArray(
      Enemies[adventure.enemy.id as 1].drops[adventure.enemy.level - 1],
    );

    inventoryManager.addItems(adventure.user.inventory, [dropedItem]);

    return finishAdventure(
      ctx,
      adventure,
      `Tu matou o ${adventure.enemy.$devName} Lvl. ${
        adventure.enemy.level
      }\nEm seu corpo, tu encontrou ${dropedItem.amount} ${
        Items[dropedItem.id as 1].$devName
      } Lvl. ${dropedItem.level}`,
    );
  }

  executeEnemyAttack(adventure);

  updateBattleMessage(ctx, adventure);
};

export { executeUserChoice, updateBattleMessage };
