import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';

const ShyCommand = createCommand({
  path: '',
  name: 'vergonha',
  nameLocalizations: { 'en-US': 'shy' },
  description: '「👉👈」・E-eto >.<, oto com vergonhinha',
  descriptionLocalizations: { 'en-US': "「👉👈」・E-eto >.<, i'm with shame nii-chan" },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que te deixou com vergonha',
      descriptionLocalizations: { 'en-US': 'User who made you ashamed' },
      required: false,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que esse usuário te deixou assim?',
      descriptionLocalizations: { 'en-US': 'Why did this user leave you like this?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);
    const selectedImage = getAssetLink('shy');
    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:vergonha.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:vergonha.no-mention.embed_description', {
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
      title: ctx.locale('commands:vergonha.embed_title'),
      description: ctx.locale('commands:vergonha.embed_description', {
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

export default ShyCommand;
