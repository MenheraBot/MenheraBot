import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import blacklistRepository from '../../database/repositories/blacklistRepository';
import relationshipRepostory from '../../database/repositories/relationshipRepostory';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { TODAYS_YEAR, COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';

const BicudaCommand = createCommand({
  path: '',
  name: 'mamar',
  nameLocalizations: { 'en-US': 'lick' },
  description: '「😝」・De uma mamada de Qualidade monstra em alguém',
  descriptionLocalizations: { 'en-US': '「😝」・Lick someone' },
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuário que você quer mamar',
      descriptionLocalizations: { 'en-US': 'User you want to lick' },
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      description: 'Por que tu quer mamar?',
      descriptionLocalizations: { 'en-US': 'Why do you wanna lick?' },
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
          content: ctx.prettyResponse('error', 'commands:mamar.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (await blacklistRepository.isUserBanned(user.id))
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:mamar.user-banned'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const avatar = getUserAvatar(ctx.author, { enableGif: true });
    const selectedImage = getAssetLink('mamar');

    const embed = createEmbed({
      title: ctx.locale('commands:mamar.embed_title'),
      description: ctx.locale('commands:mamar.embed_description', {
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

    await relationshipRepostory.executeMamar(ctx.author.id, user.id);
    finishCommand();
  },
});

export default BicudaCommand;
