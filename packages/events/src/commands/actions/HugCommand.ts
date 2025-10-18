import { ApplicationCommandOptionTypes } from '@discordeno/bot';
import { User } from '@discordeno/bot';

import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';

const HugCommand = createCommand({
  path: '',
  name: 'abraçar',
  nameLocalizations: { 'en-US': 'hug' },
  description: '「🤗」・Abraçe um amiguinho oti modeuso fofurica',
  descriptionLocalizations: {
    'en-US': '「🤗」・Hug a little friend nhaww mygodness what a cutie',
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuário que tu quer abraçar',
      descriptionLocalizations: { 'en-US': 'User that you want to hug' },
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Tem um motivo em especial para abraçar?',
      descriptionLocalizations: { 'en-US': 'Is there any special reasons for this hug?' },
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
          content: ctx.prettyResponse('warn', 'commands:abracar.bot'),
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:abracar.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('hug');

    const embed = createEmbed({
      title: ctx.locale('commands:abracar.embed_title'),
      description: ctx.locale('commands:abracar.embed_description', {
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

export default HugCommand;
