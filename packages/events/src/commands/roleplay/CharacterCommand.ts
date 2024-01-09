import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getUserStatusDisplay } from '../../modules/roleplay/statusDisplay';
import { prepareUserToBattle } from '../../modules/roleplay/devUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { checkDeath, didUserResurrect } from '../../modules/roleplay/battle/battleUtils';
import battleRepository from '../../database/repositories/battleRepository';

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

    if (user.toggles.bot) return ctx.makeMessage({ content: `Não eras, bot nao joga` });

    const isUserInBattle = await battleRepository.isUserInBattle(user.id);

    if (isUserInBattle)
      return ctx.makeMessage({
        content: `Não é possível ver os status de alguém que está em batalha`,
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(user.id);

    if (checkDeath(character)) await didUserResurrect(character);

    const embed = createEmbed({
      title: `Personagem de ${getDisplayName(ctx.user, false)}`,
      description: getUserStatusDisplay(prepareUserToBattle(character)),
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
