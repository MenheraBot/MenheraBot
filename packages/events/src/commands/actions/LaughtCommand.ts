import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';

const LaughtCommand = createCommand({
  path: '',
  name: 'rir',
  nameLocalizations: { 'en-US': 'laugh' },
  description: '「🤣」・HAHAA, PARABÉNS ZÉ. Ria de algo',
  descriptionLocalizations: { 'en-US': '「🤣」・Laugh at someone' },
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuário que te fez rir',
      descriptionLocalizations: { 'en-US': 'User that made you laugh' },
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu ta rindo?',
      descriptionLocalizations: { 'en-US': 'Why are you laughing' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);
    const selectedImage = getAssetLink('laugh');
    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:rir.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:rir.no-mention.embed_description', {
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
      title: ctx.locale('commands:rir.embed_title'),
      description: ctx.locale('commands:rir.embed_description', {
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

export default LaughtCommand;
