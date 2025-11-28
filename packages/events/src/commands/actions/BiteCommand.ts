import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { MessageFlags } from '@discordeno/bot';
import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { User } from '../../types/discordeno.js';

const BiteCommand = createCommand({
  path: '',
  name: 'morder',
  nameLocalizations: { 'en-US': 'bite' },
  description: '「👄」・Nhac. Moide alguém >.<',
  descriptionLocalizations: { 'en-US': '「👄」・Nhac. Bite someone >.<' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      descriptionLocalizations: { 'en-US': 'User to bite :3' },
      description: 'Usuário para morder :3',
      required: true,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu quer morder?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna bite?' },
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
          content: ctx.prettyResponse('warn', 'commands:morder.bot'),
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:morder.self-mention'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('bite');

    const embed = createEmbed({
      title: ctx.locale('commands:morder.embed_title'),
      description: ctx.locale('commands:morder.embed_description', {
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

export default BiteCommand;
