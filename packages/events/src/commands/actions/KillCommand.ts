import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';

const KillCommand = createCommand({
  path: '',
  name: 'matar',
  nameLocalizations: { 'en-US': 'kill' },
  description: '「☠️」・Mate aquela pessoa que tu não aguenta mais (de mentirinha hihi)',
  descriptionLocalizations: {
    'en-US': "「☠️」・Kill that person you can't take anymore (just kidding)",
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuário que você quer matar',
      descriptionLocalizations: { 'en-US': 'User that you wanna kill' },
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu quer fazer isso?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna do that?' },
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
        content: ctx.prettyResponse('error', 'commands:matar.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });
      return;
    }

    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    if (user.toggles.bot) {
      const robotsLink = [
        'https://i.imgur.com/tv9wQai.gif',
        'https://i.imgur.com/X9uUyEB.gif',
        'https://i.imgur.com/rtsjxWQ.gif',
      ];

      const selectedImage = robotsLink[Math.floor(Math.random() * robotsLink.length)];

      const embed = createEmbed({
        title: ctx.locale('commands:matar.bot.embed_title'),
        description: ctx.locale('commands:matar.bot.embed_description', {
          author: mentionUser(ctx.author.id),
          mention: mentionUser(user.id),
        }),
        image: {
          url: selectedImage,
        },
        color: COLORS.ACTIONS,
        thumbnail: { url: avatar },
      });

      if (reason)
        embed.description = `${embed.description}\n\n_"${capitalize(
          reason,
        )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`;

      await ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const selectedImage = getAssetLink('kill');

    const embed = createEmbed({
      title: ctx.locale('commands:matar.embed_title'),
      description: ctx.locale('commands:matar.embed_description', {
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

export default KillCommand;
