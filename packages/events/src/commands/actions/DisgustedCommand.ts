import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';

const DisgustedCommand = createCommand({
  path: '',
  name: 'nojo',
  nameLocalizations: { 'en-US': 'disgust' },
  description: '「🤮」・Ai que nojo cara, quem que fez isso?',
  descriptionLocalizations: { 'en-US': "「🤮」・Oh that's disgusting man, who made this?" },
  options: [
    {
      name: 'user',
      descriptionLocalizations: { 'en-US': 'User you are disgusted' },
      type: ApplicationCommandOptionTypes.User,
      description: 'suário que tu ta com nojo',
      required: false,
    },
    {
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Por que tu ta com nojo?',
      descriptionLocalizations: { 'en-US': 'Why are you disgusted?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);

    if (user?.toggles?.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:nojo.bot'),
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('disgusted');

    if (!user || user.id === ctx.author.id) {
      const embed = createEmbed({
        title: ctx.locale('commands:nojo.no-mention.embed_title'),
        color: COLORS.ACTIONS,
        description: ctx.locale('commands:nojo.no-mention.embed_description', {
          author: mentionUser(ctx.author.id),
        }),
        thumbnail: { url: avatar },
        image: { url: selectedImage },
      });

      if (reason)
        embed.description = `${embed.description}\n\n_"${capitalize(
          reason,
        )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`;

      ctx.makeMessage({ embeds: [embed] });
      return finishCommand();
    }

    const embed = createEmbed({
      title: ctx.locale('commands:nojo.embed_title'),
      description: ctx.locale('commands:nojo.embed_description', {
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

    ctx.makeMessage({ embeds: [embed] });
    finishCommand();
  },
});

export default DisgustedCommand;
