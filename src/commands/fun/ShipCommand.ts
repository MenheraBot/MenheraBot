import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment, MessageEmbed } from 'discord.js-light';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class ShipCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'ship',
      description: '「❤️」・Mostra o valor do ship de um casal',
      descriptionLocalizations: { 'en-US': "「❤️」・Shows the value of a couple's ship" },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Primeiro Usuário',
          descriptionLocalizations: { 'en-US': 'Fisrt User' },
          required: true,
        },
        {
          name: 'user_dois',
          nameLocalizations: { 'en-US': 'second_user' },
          type: 'USER',
          description: 'Segundo usuário. Caso não seja passado, o ship será feito com você',
          descriptionLocalizations: {
            'en-US': 'Second user. If not passed, the ship will be made with you',
          },
          required: false,
        },
      ],
      authorDataFields: ['married'],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user1 = ctx.options.getUser('user', true);
    const user2 = ctx.options.getUser('user_dois') ?? ctx.author;

    if (!user1) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ship.unknow-user'),
        ephemeral: true,
      });
      return;
    }

    if (!user2) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ship.unknow-user'),
        ephemeral: true,
      });
      return;
    }

    if (
      (await ctx.client.repositories.blacklistRepository.isUserBanned(user1.id)) === true ||
      (await ctx.client.repositories.blacklistRepository.isUserBanned(user2.id)) === true
    ) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:ship.banned-user'),
        ephemeral: true,
      });
      return;
    }

    const isUserMarried =
      user1.id === ctx.author.id
        ? ctx.data.user
        : await ctx.client.repositories.userRepository.find(user1.id, ['married']);

    let value = (Number(user1.id) % 51) + (Number(user2.id) % 51);
    if (value > 100) value = 100;

    if (isUserMarried?.married && isUserMarried?.married === user2.id) value = 100;

    const avatarLinkOne = user1.displayAvatarURL({ format: 'png', size: 256 });
    const avatarLinkTwo = user2.displayAvatarURL({ format: 'png', size: 256 });

    const bufferedShipImage = await requestPicassoImage(
      PicassoRoutes.Ship,
      { linkOne: avatarLinkOne, linkTwo: avatarLinkTwo, shipValue: value },
      ctx,
    );

    const guild =
      ctx.interaction.guild ?? ctx.client.guilds.forge(ctx.interaction.guildId as string);

    const member1 = await guild.members.fetch(user1.id).catch(() => null);
    const member2 = await guild.members.fetch(user2.id).catch(() => null);

    const name1 = member1?.nickname ?? user1.username;
    const name2 = member2?.nickname ?? user2.username;

    const mix = `${
      name1.substring(0, name1.length / 2) + name2.substring(name2.length / 2, name2.length)
    }`.replace(' ', '');

    const embed = new MessageEmbed()
      .setTitle(`${name1} + ${name2} = ${mix}`)
      .setDescription(
        `\n${ctx.locale('commands:ship.value')} **${value}%**\n\n${ctx.locale(
          'commands:ship.default',
        )}`,
      );

    let attc: MessageAttachment | null = null;

    if (!bufferedShipImage.err) {
      attc = new MessageAttachment(Buffer.from(bufferedShipImage.data as Buffer), 'ship.png');
      embed.setImage('attachment://ship.png');
    } else embed.setFooter({ text: ctx.locale('common:http-error') });

    if (value >= 25)
      embed
        .setColor('#cadf2a')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value}%**\n\n${ctx.locale(
            'commands:ship.low',
          )}`,
        );

    if (value >= 50)
      embed
        .setColor('#d8937b')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value}%**\n\n${ctx.locale(
            'commands:ship.ok',
          )}`,
        );

    if (value >= 75)
      embed
        .setColor('#f34a4a')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value}%**\n\n${ctx.locale(
            'commands:ship.medium',
          )}`,
        );

    if (value >= 99)
      embed
        .setColor('#ec2c2c')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value}%**\n\n${ctx.locale(
            'commands:ship.high',
          )}`,
        );

    if (value === 100)
      embed
        .setColor('#ff00df')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value}%**\n\n${ctx.locale(
            'commands:ship.perfect',
          )}`,
        );

    if (attc)
      await ctx.makeMessage({
        content: `**${ctx.locale('commands:ship.message-start')}**`,
        embeds: [embed],
        files: [attc],
      });
    else
      await ctx.makeMessage({
        content: `**${ctx.locale('commands:ship.message-start')}**`,
        embeds: [embed],
      });
  }
}
