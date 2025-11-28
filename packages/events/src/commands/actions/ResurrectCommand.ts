import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { createCommand } from '../../structures/command/createCommand.js';
import { MessageFlags } from '@discordeno/bot';
import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { User } from '../../types/discordeno.js';

const ResurrectCommand = createCommand({
  path: '',
  name: 'ressuscitar',
  nameLocalizations: { 'en-US': 'resurrect' },
  description: '「✝️」・Usa uma ult da sage em alguém',
  descriptionLocalizations: { 'en-US': '「✝️」・Use a sage ult on someone' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que você quer ressuscitar',
      descriptionLocalizations: { 'en-US': 'User you want to resurrect' },
      required: true,
    },
    {
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Por que tu quer fazer isso?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna do that?' },
      required: false,
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const reason = ctx.getOption<string>('motivo', false);

    if (user.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'commands:ressuscitar.bot'),
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('question', 'commands:ressuscitar.self-mention'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('resurrect');

    const embed = createEmbed({
      title: ctx.locale('commands:ressuscitar.embed_title'),
      description: ctx.locale('commands:ressuscitar.embed_description', {
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

export default ResurrectCommand;
