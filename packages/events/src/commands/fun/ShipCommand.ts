import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { Member, User } from 'discordeno/transformers';

import userRepository from '../../database/repositories/userRepository.js';
import { getUserAvatar } from '../../utils/discord/userUtils.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import blacklistRepository from '../../database/repositories/blacklistRepository.js';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';

const ShipCommand = createCommand({
  path: '',
  name: 'ship',
  description: '「💖」・Mostra o valor do ship de um casal',
  descriptionLocalizations: { 'en-US': "「💖」・Shows the value of a couple's ship" },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Primeiro Usuário',
      descriptionLocalizations: { 'en-US': 'Fisrt User' },
      required: true,
    },
    {
      name: 'user_dois',
      nameLocalizations: { 'en-US': 'second_user' },
      type: ApplicationCommandOptionTypes.User,
      description: 'Segundo usuário. Caso não seja passado, o ship será feito com você',
      descriptionLocalizations: {
        'en-US': 'Second user. If not passed, the ship will be made with you',
      },
      required: false,
    },
  ],
  category: 'fun',
  authorDataFields: ['married'],
  execute: async (ctx, finishCommand) => {
    const firstUser = ctx.getOption<User>('user', 'users', true);
    const secondUser = ctx.getOption<User>('user_dois', 'users', false) ?? ctx.author;

    if (
      (await blacklistRepository.isUserBanned(firstUser.id)) ||
      (await blacklistRepository.isUserBanned(secondUser.id))
    )
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:ship.banned-user'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    await ctx.defer();

    const firstUserData =
      firstUser.id === ctx.author.id ? ctx.authorData : await userRepository.findUser(firstUser.id);

    let value = (Number(firstUser.id) % 51) + (Number(secondUser.id) % 51);
    if (value > 100) value = 100;

    if (firstUserData?.married && firstUserData.married === `${secondUser.id}`) value = 100;

    const firstAvatar = getUserAvatar(firstUser);
    const secondAvatar = getUserAvatar(secondUser);

    const shipImage = await vanGoghRequest(VanGoghEndpoints.Ship, {
      linkOne: firstAvatar,
      linkTwo: secondAvatar,
      shipValue: value,
    });

    const firstUserNick =
      ctx.getOption<Member>('user', 'members', false)?.nick ?? firstUser.username;
    const secondUserNick =
      ctx.getOption<Member>('user_dois', 'members', false)?.nick ?? secondUser.username;

    const mix =
      firstUserNick.substring(0, firstUserNick.length / 2) +
      secondUserNick.substring(secondUserNick.length / 2, secondUserNick.length);

    const embed = createEmbed({
      title: `${firstUserNick} + ${secondUserNick} = ${mix}`,
      description: ctx.locale('commands:ship.description', {
        value,
        shipText: ctx.locale('commands:ship.default'),
      }),
    });

    if (!shipImage.err) embed.image = { url: 'attachment://ship.png' };
    else embed.footer = { text: ctx.locale('common:http-error') };

    if (value >= 25) {
      embed.color = 0xcadf2a;
      embed.description = ctx.locale('commands:ship.description', {
        value,
        shipText: ctx.locale('commands:ship.low'),
      });
    }

    if (value >= 50) {
      embed.color = 0xd8937b;
      embed.description = ctx.locale('commands:ship.description', {
        value,
        shipText: ctx.locale('commands:ship.ok'),
      });
    }

    if (value >= 75) {
      embed.color = 0xf34a4a;
      embed.description = ctx.locale('commands:ship.description', {
        value,
        shipText: ctx.locale('commands:ship.medium'),
      });
    }

    if (value >= 99) {
      embed.color = 0xec2c2c;
      embed.description = ctx.locale('commands:ship.description', {
        value,
        shipText: ctx.locale('commands:ship.high'),
      });
    }

    if (value === 100) {
      embed.color = 0xff00df;
      embed.description = ctx.locale('commands:ship.description', {
        value,
        shipText: ctx.locale('commands:ship.perfect'),
      });
    }

    await ctx.makeMessage({
      content: ctx.locale('commands:ship.message-start'),
      embeds: [embed],
      file: shipImage.err ? undefined : { blob: shipImage.data, name: 'ship.png' },
    });

    finishCommand();
  },
});

export default ShipCommand;
