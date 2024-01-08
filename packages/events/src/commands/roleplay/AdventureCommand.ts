import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import {
  confirmAdventure,
  getCurrentAvailableAdventure,
} from '../../modules/roleplay/adventureManager';
import { orchestrateRoleplayRelatedComponentInteractions } from '../../modules/roleplay/componentInteractionReceptor';
import { checkDeath, didUserResurrect } from '../../modules/roleplay/battle/battleUtils';
import { millisToSeconds } from '../../utils/miscUtils';

const AdventureCommand = createCommand({
  path: '',
  name: 'aventura',
  nameLocalizations: { 'en-US': 'adventure' },
  description: '「RPG」・Veja o seu personagem do RPG',
  descriptionLocalizations: {
    'en-US': '「RPG」・Check your RPG character',
  },
  category: 'roleplay',
  commandRelatedExecutions: [orchestrateRoleplayRelatedComponentInteractions],
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const character = await roleplayRepository.getCharacter(ctx.user.id);

    if (checkDeath(character)) {
      const userAlive = await didUserResurrect(character);

      if (!userAlive)
        return ctx.makeMessage({
          content: `Você está morto! Você poderá entrar em uma aventura <t:${millisToSeconds(
            character.deadUntil,
          )}:R>`,
        });
    }

    const enemy = getCurrentAvailableAdventure();

    if (!enemy) return ctx.makeMessage({ content: `Não há inimigos disponíveis por perto` });

    confirmAdventure(ctx, prepareUserToBattle(character), enemy);
  },
});

export default AdventureCommand;
