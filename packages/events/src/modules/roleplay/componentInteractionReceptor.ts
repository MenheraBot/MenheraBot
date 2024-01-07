import roleplayRepository from '../../database/repositories/roleplayRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import { getCurrentAvailableAdventure } from './adventureManager';
import { displayBattleControlMessage } from './battle/displayBattleState';
import { executeUserChoice } from './battle/executeUserChoice';
import { prepareUserToBattle, setupAdventurePvE, unknownAdventure } from './devUtils';

const orchestrateRoleplayRelatedComponentInteractions = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  const [action] = ctx.sentData;

  if (action === 'JOIN_DUNGEON') {
    const character = await roleplayRepository.getCharacter(ctx.user.id);
    const enemy = getCurrentAvailableAdventure();

    if (!enemy)
      return ctx.makeMessage({
        content: `Não há inimigos disponíveis por perto`,
        components: [],
        embeds: [],
      });

    const adventure = setupAdventurePvE(ctx, prepareUserToBattle(character), enemy);

    await roleplayRepository.setAdventure(`${ctx.user.id}`, adventure);

    displayBattleControlMessage(ctx, adventure);
    return;
  }

  if (action === 'USE_SKILL') {
    const [, adventureId] = ctx.sentData;
    const currentBattle = await roleplayRepository.getAdventure(adventureId);

    if (!currentBattle) return unknownAdventure(ctx);

    return executeUserChoice(
      ctx as ComponentInteractionContext<SelectMenuInteraction>,
      currentBattle,
    );
  }
};

export { orchestrateRoleplayRelatedComponentInteractions };
