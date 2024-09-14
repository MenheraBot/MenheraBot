import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../../types/interaction';
import { MessageFlags } from '../../../utils/discord/messageUtils';
import { getAbility } from '../data/abilities';
import { PlayerVsEnviroment } from '../types';
import { clearBattleTimer } from './battleTimers';
import { checkDeath, keepLimitsOk } from './battleUtils';
import { updateBattleMessage } from './displayBattleState';
import { applyAbilityEffects, executeEntitiesEffects } from './executeEffects';
import { executeEnemyAttack } from './executeEnemyAttack';

const executeUserChoice = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  const [choiceStringedId] = ctx.interaction.data.values;

  const selectedAbility = getAbility(Number(choiceStringedId));

  if (selectedAbility.energyCost > adventure.user.energy)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:aventura.battle.no-energy'),
      flags: MessageFlags.EPHEMERAL,
    });

  if (choiceStringedId !== '0') {
    const userAbility = adventure.user.abilitites.find((a) => `${a.id}` === choiceStringedId);

    if (!userAbility)
      throw new Error(`User dont have selected ability. Selected: ${choiceStringedId}`);

    userAbility.proficience += 1;
  }

  adventure.user.energy -= selectedAbility.energyCost;

  clearBattleTimer(`battle_timeout:${adventure.id}`);

  executeEntitiesEffects(adventure);

  keepLimitsOk(adventure.user);

  applyAbilityEffects(adventure, selectedAbility.effects);

  keepLimitsOk(adventure.user);

  if (!checkDeath(adventure.enemy)) executeEnemyAttack(adventure);

  updateBattleMessage(ctx, adventure);
};

export { executeUserChoice };
