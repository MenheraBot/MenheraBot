import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { MessageFlags } from '../../utils/discord/messageUtils';
import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';

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
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const reason = ctx.getOption<string>('motivo', false);

    if (user.toggles.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:morder.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:morder.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });
      return;
    }

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

    await ctx.makeMessage({ embeds: [embed] });
  },
});

export default BiteCommand;
