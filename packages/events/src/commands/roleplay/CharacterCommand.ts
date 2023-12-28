import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import characterRepository from '../../database/repositories/characterRepository';
import { mentionUser } from '../../utils/discord/userUtils';

const CharacterCommand = createCommand({
  path: '',
  name: 'personagem',
  description: '「RPG」・Veja o seu personagem do RPG',
  descriptionLocalizations: {
    'en-US': '「RPG」・Check your RPG character',
  },
  options: [
    {
      name: 'jogador',
      nameLocalizations: { 'en-US': 'player' },
      type: ApplicationCommandOptionTypes.User,
      description: 'Jogador que tu quer ver o personagem',
      descriptionLocalizations: { 'en-US': 'Player that you want to check the character' },
      required: false,
    },
  ],
  category: 'roleplay',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const user = ctx.getOption<User>('jogador', 'users', false) ?? ctx.user;
    const character = await characterRepository.getCharacter(user.id);

    await ctx.makeMessage({
      content: `Bem vindo, jogador ${mentionUser(character.id)}!`,
      allowedMentions: { users: [user.id] },
    });
  },
});

export default CharacterCommand;
