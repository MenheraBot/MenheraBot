import { User } from '@discordeno/bot';
import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { createCommand } from '../../structures/command/createCommand.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';

const PunchCommand = createCommand({
  path: '',
  name: 'socar',
  nameLocalizations: { 'en-US': 'punch' },
  description: '「👊」・Da um socão em alguém',
  descriptionLocalizations: { 'en-US': '「👊」・Punch someone' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que você quer socar',
      descriptionLocalizations: { 'en-US': 'User you wanna punch' },
      required: true,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu quer socar man?',
      descriptionLocalizations: { 'en-US': 'Why do you wann punch?' },
      required: false,
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const reason = ctx.getOption<string>('motivo', false);

    if (user.toggles.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:socar.bot'),
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:socar.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('punch');

    const embed = createEmbed({
      title: ctx.locale('commands:socar.embed_title'),
      description: ctx.locale('commands:socar.embed_description', {
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

export default PunchCommand;
