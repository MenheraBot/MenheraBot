import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { createCommand } from '../../structures/command/createCommand.js';
import { MessageFlags } from '@discordeno/bot';
import { TODAYS_YEAR, COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { User } from '../../types/discordeno.js';

const PokeCommand = createCommand({
  path: '',
  name: 'cutucar',
  nameLocalizations: { 'en-US': 'poke' },
  description: '「👉」・Da uma cutucadinha em alguém',
  descriptionLocalizations: { 'en-US': '「👉」・Give someone a little poke' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que você quer cutucar',
      descriptionLocalizations: { 'en-US': 'User you want to poke' },
      required: true,
    },
    {
      name: 'motivo',
      type: ApplicationCommandOptionTypes.String,
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu ta cutucando?',
      descriptionLocalizations: { 'en-US': 'Why are you poking?' },
      required: false,
      maxLength: 300,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const reason = ctx.getOption<string>('motivo', false);

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:cutucar.self-mention'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('poke');

    const embed = createEmbed({
      title: ctx.locale('commands:cutucar.embed_title'),
      description: ctx.locale('commands:cutucar.embed_description', {
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

export default PokeCommand;
