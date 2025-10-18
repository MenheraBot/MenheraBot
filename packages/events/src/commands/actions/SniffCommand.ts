import { User } from '@discordeno/bot';
import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';

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
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);

    if (user && user.toggles.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:cheirar.bot'),
        }),
      );

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
      return finishCommand();
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
    finishCommand();
  },
});

export default SniffCommand;
