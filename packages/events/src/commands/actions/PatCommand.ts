import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/miscUtils';

const PatCommand = createCommand({
  path: '',
  name: 'carinho',
  description: '「🥰」・Oti meudeus, faz carinho em alguém',
  nameLocalizations: { 'en-US': 'cuddle' },
  descriptionLocalizations: { 'en-US': '「😊」・Cuddle someone' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que você quer fazer carinho',
      descriptionLocalizations: { 'en-US': 'User you want to cuddle' },
      required: true,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu quer fazer carinho?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna cuddle?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const reason = ctx.getOption<string>('motivo', false);

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:carinho.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });
      return;
    }

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('pat');

    const embed = createEmbed({
      title: ctx.locale('commands:carinho.embed_title'),
      description: ctx.locale('commands:carinho.embed_description', {
        author: mentionUser(ctx.author.id),
        mention: mentionUser(user.id),
      }),
      image: { url: selectedImage },
      color: COLORS.ACTIONS,
      thumbnail: { url: avatar },
    });

    if (reason)
      embed.description = `${embed.description}\n\n_"${capitalize(
        reason,
      )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`;

    await ctx.makeMessage({ embeds: [embed] });
  },
});

export default PatCommand;
