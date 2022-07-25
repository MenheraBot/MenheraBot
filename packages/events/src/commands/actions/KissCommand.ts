import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';

const KissCommand = createCommand({
  path: '',
  name: 'beijar',
  nameLocalizations: {
    'en-US': 'kiss',
  },
  description: '「😘」・De uma beijoquita em alguém que tu goste',
  descriptionLocalizations: { 'en-US': '「😘」・Give a kiss to someone you like' },
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuário que você quer beijar',
      descriptionLocalizations: { 'en-US': 'User that you wanna kiss' },
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'local',
      nameLocalizations: { 'en-US': 'place' },
      description: 'Lugar que você quer dar o beijo',
      descriptionLocalizations: { 'en-US': 'Place you want to kiss' },
      required: true,
      choices: [
        { name: '👄 | Boca', value: 'kiss', nameLocalizations: { 'en-US': '👄 | Mouth' } },
        { name: '🌸 | Bochecha', value: 'cheek', nameLocalizations: { 'en-US': '🌸 | Cheek' } },
      ],
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que voce quer beijar?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna kiss?' },
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
        content: ctx.prettyResponse('error', 'commands:beijar.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:beijar.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });
      return;
    }

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const local = ctx.getOption<string>('local', false, true) as 'kiss';
    const selectedImage = getAssetLink(local);

    const embed = createEmbed({
      title: ctx.locale('commands:beijar.embed_title'),
      description: ctx.locale(`commands:beijar.embed_description_${local}`, {
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
  },
});

export default KissCommand;
