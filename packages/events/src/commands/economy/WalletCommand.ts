import { User } from '@discordeno/bot';
import { ApplicationCommandOptionTypes } from '@discordeno/bot';

import { EMOJIS } from '../../structures/constants.js';
import userRepository from '../../database/repositories/userRepository.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';

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
          name: `${EMOJIS.estrelinhas} | ${ctx.locale('commands:carteira.stars')}`,
          value: `**${userData.estrelinhas}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.roll} | ${ctx.locale('commands:carteira.rolls')}`,
          value: `**${userData.rolls}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.demons} | ${ctx.locale('commands:carteira.demons')} `,
          value: `**${userData.demons}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.giants} | ${ctx.locale('commands:carteira.giants')}`,
          value: `**${userData.giants}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.angels} | ${ctx.locale('commands:carteira.angels')}`,
          value: `**${userData.angels}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.archangels} | ${ctx.locale('commands:carteira.archangel')}`,
          value: `**${userData.archangels}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.demigods} | ${ctx.locale('commands:carteira.sd')}`,
          value: `**${userData.demigods}**`,
          inline: true,
        },
        {
          name: `${EMOJIS.gods} | ${ctx.locale('commands:carteira.god')}`,
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
