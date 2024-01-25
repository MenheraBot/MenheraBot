import battleRepository from '../../database/repositories/battleRepository';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import { minutesToMillis } from '../../utils/miscUtils';
import { getCurrentAvailableAdventure } from './adventureManager';
import { startBattleTimer } from './battle/battleTimers';
import { displayBattleControlMessage } from './battle/displayBattleState';
import { executeUserChoice } from './battle/executeUserChoice';
import { MINUTES_TO_FORCE_FINISH_BATTLE } from './constants';
import { prepareUserToBattle, setupAdventurePvE, unknownAdventure } from './devUtils';
import { BattleTimerActionType } from './types';

const orchestrateRoleplayRelatedComponentInteractions = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  const [action] = ctx.sentData;

  if (action === 'JOIN_DUNGEON') {
    const character = await roleplayRepository.getCharacter(ctx.user.id);
    const enemy = await getCurrentAvailableAdventure();

    if (!enemy)
      return ctx.makeMessage({
        content: `Não há inimigos disponíveis por perto`,
        components: [],
        embeds: [],
      });

    const adventure = setupAdventurePvE(ctx, prepareUserToBattle(character), enemy);

    await battleRepository.setAdventure(`${ctx.user.id}`, adventure);

    startBattleTimer(`finish_battle:${adventure.id}`, {
      battleId: adventure.id,
      executeAt: Date.now() + minutesToMillis(MINUTES_TO_FORCE_FINISH_BATTLE),
      type: BattleTimerActionType.FORCE_FINISH_BATTLE,
    });

    displayBattleControlMessage(ctx, adventure);
    return;
  }

  if (action === 'USE_SKILL') {
    const [, adventureId] = ctx.sentData;
    const currentBattle = await battleRepository.getAdventure(adventureId);

    if (!currentBattle) return unknownAdventure(ctx);

    return executeUserChoice(
      ctx as ComponentInteractionContext<SelectMenuInteraction>,
      currentBattle,
    );
  }
};

export { orchestrateRoleplayRelatedComponentInteractions };
