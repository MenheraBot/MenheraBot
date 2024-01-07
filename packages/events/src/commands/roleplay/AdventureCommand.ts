import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import {
  confirmAdventure,
  getCurrentAvailableAdventure,
} from '../../modules/roleplay/adventureManager';
import { orchestrateRoleplayRelatedComponentInteractions } from '../../modules/roleplay/componentInteractionReceptor';

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
    const enemy = getCurrentAvailableAdventure();

    if (!enemy) return ctx.makeMessage({ content: `Não há inimigos disponíveis por perto` });

    confirmAdventure(ctx, prepareUserToBattle(character), enemy);
  },
});

export default AdventureCommand;
