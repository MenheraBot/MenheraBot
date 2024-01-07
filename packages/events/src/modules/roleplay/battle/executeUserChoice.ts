import roleplayRepository from '../../../database/repositories/roleplayRepository';
import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../../types/interaction';
import { MessageFlags } from '../../../utils/discord/messageUtils';
import { PlayerVsEnviroment } from '../types';
import { checkDeath } from './battleUtils';
import { displayBattleControlMessage } from './displayBattleState';
import { executeEnemyAttack } from './executeEnemyAttack';

const applyDamage = (
  _ctx: ComponentInteractionContext,
  adventure: PlayerVsEnviroment,
  abilityId: number,
): void => {
  switch (abilityId) {
    case 0: {
      adventure.enemy.life -= adventure.user.damage;
      adventure.user.energy -= 1;

      break;
    }
  }
};

const executeUserChoice = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  const [choiceStringedId] = ctx.interaction.data.values;

  const cost = 1;

  if (cost > adventure.user.energy)
    return ctx.respondInteraction({
      content: 'Não tem energia para usar',
      flags: MessageFlags.EPHEMERAL,
    });

  applyDamage(ctx, adventure, Number(choiceStringedId));

  if (checkDeath(adventure.enemy))
    return ctx.makeMessage({ content: 'VOCE MATOU O INIMIGO!', embeds: [], components: [] });

  executeEnemyAttack(ctx, adventure);

  if (checkDeath(adventure.user))
    return ctx.makeMessage({ content: 'VOCE MORREU!', embeds: [], components: [] });

  await roleplayRepository.setAdventure(adventure.id, adventure);

  displayBattleControlMessage(ctx, adventure);
};

export { executeUserChoice };
