import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
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
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const reason = ctx.getOption<string>('motivo', false);

    const selectedImage = getAssetLink('grumble');

    const embed = createEmbed({
      title: ctx.locale('commands:resmungar.embed_title'),
      description: ctx.locale('commands:resmungar.embed_description', {
        author: mentionUser(ctx.author.id),
      }),
      image: { url: selectedImage },
      color: COLORS.ACTIONS,
      thumbnail: { url: 'https://i.imgur.com/UMnJW64.png' },
    });

    if (reason)
      embed.description = `${embed.description}\n\n_"${capitalize(
        reason,
      )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`;

    await ctx.makeMessage({ embeds: [embed] });
    return finishCommand();
  },
});

export default GrumbleCommand;
