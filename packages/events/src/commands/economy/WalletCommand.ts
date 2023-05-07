import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import userRepository from '../../database/repositories/userRepository';
import { createCommand } from '../../structures/command/createCommand';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';

const WalletCommand = createCommand({
  path: '',
  name: 'carteira',
  nameLocalizations: { 'en-US': 'wallet' },
  description: '「💳」・Mostra a carteira de alguém',
  descriptionLocalizations: { 'en-US': "「💳」・Show someone's wallet" },
  options: [
    {
      name: 'user',
      description: 'Usuário para mostrar a carteira',
      descriptionLocalizations: { 'en-US': 'User to show wallet' },
      type: ApplicationCommandOptionTypes.User,
      required: false,
    },
  ],
  category: 'economy',
  authorDataFields: [
    'estrelinhas',
    'demons',
    'giants',
    'angels',
    'archangels',
    'selectedColor',
    'gods',
    'demigods',
    'rolls',
  ],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users') ?? ctx.author;

    const userData =
      user.id === ctx.author.id ? ctx.authorData : await userRepository.ensureFindUser(user.id);

    if (userData.ban)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:carteira.banned-user'),
        }),
      );

    const embed = createEmbed({
      title: ctx.locale('commands:carteira.title', {
        user: getDisplayName(user),
      }),
      color: hexStringToNumber(userData.selectedColor),
      fields: [
        {
          name: `⭐ | ${ctx.locale('commands:carteira.stars')}`,
          value: `**${userData.estrelinhas}**`,
          inline: true,
        },
        {
          name: `🔑 | ${ctx.locale('commands:carteira.rolls')}`,
          value: `**${userData.rolls}**`,
          inline: true,
        },
        {
          name: `<:DEMON:758765044443381780> | ${ctx.locale('commands:carteira.demons')} `,
          value: `**${userData.demons}**`,
          inline: true,
        },
        {
          name: `🦍 | ${ctx.locale('commands:carteira.giants')}`,
          value: `**${userData.giants}**`,
          inline: true,
        },
        {
          name: `<:ANGEL:758765044204437535> | ${ctx.locale('commands:carteira.angels')}`,
          value: `**${userData.angels}**`,
          inline: true,
        },
        {
          name: `👼| ${ctx.locale('commands:carteira.archangel')}`,
          value: `**${userData.archangels}**`,
          inline: true,
        },
        {
          name: `<:SemiGod:758766732235374674> | ${ctx.locale('commands:carteira.sd')}`,
          value: `**${userData.demigods}**`,
          inline: true,
        },
        {
          name: `<:God:758474639570894899> | ${ctx.locale('commands:carteira.god')}`,
          value: `**${userData.gods}**`,
          inline: true,
        },
      ],
    });

    ctx.makeMessage({ embeds: [embed] });
    finishCommand();
  },
});

export default WalletCommand;
