import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { createCommand } from '../../structures/command/createCommand.js';
import { MessageFlags } from '@discordeno/bot';
import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { User } from '../../types/discordeno.js';

const BicudaCommand = createCommand({
  path: '',
  name: 'bicuda',
  description: '「🦵」・Da uma bicudassa em alguém',
  nameLocalizations: { 'en-US': 'kick' },
  descriptionLocalizations: { 'en-US': '「🦶」・Give someone a kick' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      descriptionLocalizations: { 'en-US': 'User to kick' },
      description: 'Usuário para dar a bicuda',
      required: true,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que você quer chutar?',
      descriptionLocalizations: { 'en-US': 'Why are you angry?' },
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
          content: ctx.prettyResponse('warn', 'commands:bicuda.bot'),
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:bicuda.self-mention'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('bicuda');

    const embed = createEmbed({
      title: ctx.locale('commands:bicuda.embed_title'),
      description: ctx.locale('commands:bicuda.embed_description', {
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

export default BicudaCommand;
