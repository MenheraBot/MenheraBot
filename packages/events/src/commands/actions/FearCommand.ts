import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { User } from '../../types/discordeno.js';

const FearCommand = createCommand({
  path: '',
  name: 'medo',
  nameLocalizations: { 'en-US': 'fear' },
  description: '「😮」・Mostre para todos que tu ta com medo',
  descriptionLocalizations: { 'en-US': "「😮」・Show everyone you're scared" },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      descriptionLocalizations: { 'en-US': 'User who scared you' },
      description: 'Usuário que te deixou com medo',
      required: false,
    },
    {
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Por que tu ta com medo?',
      descriptionLocalizations: { 'en-US': 'Why are you afraid?' },
      required: false,
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    const selectedImage = getAssetLink('fear');
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:medo.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:medo.no-mention.embed_description', {
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
      title: ctx.locale('commands:medo.embed_title'),
      description: ctx.locale('commands:medo.embed_description', {
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

export default FearCommand;
