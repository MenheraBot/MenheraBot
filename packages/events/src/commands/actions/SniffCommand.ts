import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/stringUtils';
import { createCommand } from '../../structures/command/createCommand';

const SniffCommand = createCommand({
  path: '',
  name: 'cheirar',
  nameLocalizations: { 'en-US': 'sniff' },
  description: '「👃」・Da uma cheiradinha em alguém hgmmm',
  descriptionLocalizations: { 'en-US': '「👃」・Give someone a sniff hgmmm' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário pra mete a narigada sugadora ultradimensional',
      descriptionLocalizations: { 'en-US': 'User to make the ultradimensional sniffer' },
      required: false,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu quer dar a talda cheirada?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna sniff? (strange question)' },
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
        content: ctx.prettyResponse('error', 'commands:cheirar.bot'),
      });
      return;
    }

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('sniff');

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:cheirar.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:cheirar.no-mention.embed_description', {
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
      title: ctx.locale('commands:cheirar.embed_title'),
      description: ctx.locale('commands:cheirar.embed_description', {
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

export default SniffCommand;
