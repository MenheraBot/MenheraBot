import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/stringUtils';
import { createCommand } from '../../structures/command/createCommand';

const ThinkCommand = createCommand({
  path: '',
  name: 'pensar',
  nameLocalizations: { 'en-US': 'think' },
  description: '「🤔」・Ser ou não ser? Eis a questão. Pense, pense sobre alguém',
  descriptionLocalizations: {
    'en-US': '「🤔」・To be or not to be? That is the question. Think, think about someone',
  },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário em que você está pensando',
      descriptionLocalizations: { 'en-US': 'User you are thinking of' },
      required: false,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu ta pensando?',
      descriptionLocalizations: { 'en-US': 'Why are you thinking?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);

    if (user && user.toggles.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:pensar.bot'),
      });
      return;
    }

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('think');

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:pensar.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:pensar.no-mention.embed_description', {
          author: mentionUser(ctx.author.id),
        }),
        thumbnail: { url: avatar },
        image: { url: selectedImage },
      });

      if (reason)
        embed.description = `${embed.description}\n\n_"${capitalize(
          reason,
        )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`;

      await ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const embed = createEmbed({
      title: ctx.locale('commands:pensar.embed_title'),
      description: ctx.locale('commands:pensar.embed_description', {
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

export default ThinkCommand;
