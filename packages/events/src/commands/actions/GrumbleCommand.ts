import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/createEmbed';
import { capitalize } from '../../utils/stringUtils';
import { createCommand } from '../../structures/command/createCommand';

const GrumbleCommand = createCommand({
  path: '',
  name: 'resmungar',
  nameLocalizations: { 'en-US': 'grumble' },
  description: '「😖」・Mostre para todos que tu ta resmungando. Humpf',
  descriptionLocalizations: { 'en-US': "「😖」・Show everyone you're mumbling. humpf" },
  options: [
    {
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Por que tu ta resmungando?',
      descriptionLocalizations: { 'en-US': 'Why are you grumbling?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx) => {
    const reason = ctx.getOption<string>('motivo', false);
    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    const selectedImage = getAssetLink('grumble');

    const embed = createEmbed({
      title: ctx.locale('commands:resmungar.embed_title'),
      description: ctx.locale('commands:resmungar.embed_description', {
        author: mentionUser(ctx.author.id),
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

export default GrumbleCommand;
