import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';

const CharacterCommand = createCommand({
  path: '',
  name: 'personagem',
  nameLocalizations: { 'en-US': 'character' },
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

    if (user.toggles.bot) return ctx.makeMessage({ content: `Nao eras, bot nao joga` });

    const character = await roleplayRepository.getCharacter(user.id);

    const embed = createEmbed({
      title: `Personagem de ${getDisplayName(ctx.user, false)}`,
      description: `:heart: Vida: **${character.life}**`,
      thumbnail: { url: getUserAvatar(user, { enableGif: true }) },
    });

    await ctx.makeMessage({
      content: `Bem vindo, jogador ${mentionUser(character.id)}!`,
      allowedMentions: { users: [user.id] },
      embeds: [embed],
    });
  },
});

export default CharacterCommand;
