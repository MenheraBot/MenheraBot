import { createCommand } from '../../structures/command/createCommand';
import characterRepository from '../../database/repositories/characterRepository';

const AdventureCommand = createCommand({
  path: '',
  name: 'aventura',
  nameLocalizations: { 'en-US': 'adventure' },
  description: '「RPG」・Veja o seu personagem do RPG',
  descriptionLocalizations: {
    'en-US': '「RPG」・Check your RPG character',
  },
  category: 'roleplay',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const character = await characterRepository.getCharacter(ctx.user.id);

    
  },
});

export default AdventureCommand;
