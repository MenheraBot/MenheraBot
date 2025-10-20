import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { User } from '../../types/discordeno.js';

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
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que você está chorando?',
      descriptionLocalizations: { 'en-US': 'Why are you crying?' },
      required: false,
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', false);
    const reason = ctx.getOption<string>('motivo', false);

    if (user?.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:chorar.bot'),
        }),
      );

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

      ctx.makeMessage({ embeds: [embed] });
      return finishCommand();
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

    ctx.makeMessage({ embeds: [embed] });
    return finishCommand();
  },
});

export default CryCommand;
