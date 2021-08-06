import { MessageAttachment, MessageEmbed, User } from 'discord.js';
import Command from '@structures/command/Command';
import NewHttp from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class ShipCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ship',
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (!ctx.args[0]) {
      await ctx.replyT('error', 'commands:ship.missing-args');
      return;
    }
    if (!ctx.message.guild) return;

    let user2: User;
    let user1: User;

    try {
      user1 = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
      user2 = ctx.args[1]
        ? await this.client.users.fetch(ctx.args[1].replace(/[<@!>]/g, ''))
        : ctx.message.author;
    } catch {
      await ctx.replyT('error', 'commands:ship.unknow-user');
      return;
    }

    if (!user1) {
      await ctx.replyT('error', 'commands:ship.unknow-user');
      return;
    }

    if (!user2) {
      await ctx.replyT('error', 'commands:ship.unknow-user');
      return;
    }

    const dbUserToTakeValue1 = await this.client.repositories.userRepository.find(user1.id);
    const dbUserToTakeValue2 = await this.client.repositories.userRepository.find(user2.id);

    const FinalValue1 = dbUserToTakeValue1?.shipValue
      ? dbUserToTakeValue1.shipValue
      : Math.floor(Math.random() * 55);
    const FinalValue2 = dbUserToTakeValue2?.shipValue
      ? dbUserToTakeValue2.shipValue
      : Math.floor(Math.random() * 55);

    let value = Number(FinalValue1) + Number(FinalValue2);
    if (Number(value) >= 100) {
      value = 100;
    }

    if (dbUserToTakeValue1?.casado && dbUserToTakeValue1?.casado === user2.id) value = 100;

    const avatarLinkOne = user1.displayAvatarURL({ format: 'png', size: 256 });
    const avatarLinkTwo = user2.displayAvatarURL({ format: 'png', size: 256 });
    const bufferedShipImage = await NewHttp.shipRequest(avatarLinkOne, avatarLinkTwo, value);

    const member1 = ctx.message.guild.members.cache.get(user1.id);
    const member2 = ctx.message.guild.members.cache.get(user2.id);

    const name1 = member1 && member1?.nickname ? member1.nickname : user1.username;
    const name2 = member2 && member2?.nickname ? member2.nickname : user2.username;
    const mix = `${
      name1.substring(0, name1.length / 2) + name2.substring(name2.length / 2, name2.length)
    }`.replace(' ', '');

    const embed = new MessageEmbed()
      .setTitle(`${name1} + ${name2} = ${mix}`)
      .setDescription(
        `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
          'commands:ship.default',
        )}`,
      );

    let attc: MessageAttachment | null = null;

    if (!bufferedShipImage.err) {
      attc = new MessageAttachment(Buffer.from(bufferedShipImage.data as Buffer), 'ship.png');
      embed.setImage('attachment://ship.png');
    } else embed.setFooter(ctx.locale('commands:http-error'));

    if (Number(value) >= 25)
      embed
        .setColor('#cadf2a')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.low',
          )}`,
        );
    if (Number(value) >= 50)
      embed
        .setColor('#d8937b')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.ok',
          )}`,
        );
    if (Number(value) >= 75)
      embed
        .setColor('#f34a4a')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.medium',
          )}`,
        );
    if (Number(value) >= 99)
      embed
        .setColor('#ec2c2c')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.high',
          )}`,
        );
    if (Number(value) === 100)
      embed
        .setColor('#ff00df')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.perfect',
          )}`,
        );

    if (attc)
      await ctx.sendC(`${ctx.message.author}\n**${ctx.locale('commands:ship.message-start')}**`, {
        embeds: [embed],
        files: [attc],
      });
    else
      await ctx.sendC(`${ctx.message.author}\n**${ctx.locale('commands:ship.message-start')}**`, {
        embeds: [embed],
      });
  }
}
