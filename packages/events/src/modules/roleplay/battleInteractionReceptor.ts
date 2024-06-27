import battleRepository from '../../database/repositories/battleRepository';
import commandRepository from '../../database/repositories/commandRepository';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import { startAdventure } from './adventureManager';
import { executeUserChoice } from './battle/executeUserChoice';
import { unknownAdventure } from './devUtils';
import { Action } from './types';
import { getCurrentAvailableEnemy } from './worldEnemiesManager';

const battleInteractionReceptor = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, embedColor] = ctx.sentData;

  if (action === 'JOIN_DUNGEON') {
    const character = await roleplayRepository.getCharacter(ctx.user.id);

    if (await battleRepository.isUserInBattle(ctx.user.id))
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:aventura.in-battle'),
        components: [],
        embeds: [],
      });

    if (![Action.NONE, Action.TRAVEL].includes(character.currentAction.type))
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:aventura.other-action'),
      });

    const enemy = await getCurrentAvailableEnemy(character.location);

    if (!enemy)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:aventura.no-enemies', {
          travelCommandId: (await commandRepository.getCommandInfo('viajar'))?.discordId,
        }),
        components: [],
        embeds: [],
      });

    return startAdventure(ctx, character, enemy, embedColor);
  }

  if (action === 'USE_SKILL') {
    const currentBattle = await battleRepository.getAdventure(`${ctx.originalInteractionId}`);

    if (!currentBattle) return unknownAdventure(ctx);

    return executeUserChoice(
      ctx as ComponentInteractionContext<SelectMenuInteraction>,
      currentBattle,
    );
  }
};

export { battleInteractionReceptor };
