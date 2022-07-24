import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/stringUtils';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';

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
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const reason = ctx.getOption<string>('motivo', false);

    if (user.toggles.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:abracar.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:abracar.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });
      return;
    }

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
  },
});

export default HugCommand;
