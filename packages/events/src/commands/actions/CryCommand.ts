import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';

const CryCommand = createCommand({
  path: '',
  name: 'chorar',
  nameLocalizations: { 'en-US': 'cry' },
  description: '「😭」・Mostre para os que você está chorando :((',
  descriptionLocalizations: { 'en-US': "「😭」・Show everyone that you're crying :((" },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que te fez chorar',
      descriptionLocalizations: { 'en-US': 'User that made you cry' },
      required: false,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.User,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que você está chorando?',
      descriptionLocalizations: { 'en-US': 'Why are you crying?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);

    if (user?.toggles?.bot) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:chorar.bot'),
      });
      return;
    }

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('cry');

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:chorar.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:chorar.no-mention.embed_description', {
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
      title: ctx.locale('commands:chorar.embed_title'),
      description: ctx.locale('commands:chorar.embed_description', {
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

export default CryCommand;
