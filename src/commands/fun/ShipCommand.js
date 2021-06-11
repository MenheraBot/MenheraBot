const { MessageEmbed, MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const NewHttp = require('../../utils/NewHttp.js');

module.exports = class ShipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ship',
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:ship.missing-args');

    let user2;
    let user1;

    try {
      user1 = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
      user2 = ctx.args[1] ? await this.client.users.fetch(ctx.args[1].replace(/[<@!>]/g, '')) : ctx.message.author;
    } catch {
      return ctx.replyT('error', 'commands:ship.unknow-user');
    }

    if (!user1) return ctx.replyT('error', 'commands:ship.unknow-user');
    if (!user2) return ctx.replyT('error', 'commands:ship.unknow-user');

    const dbUserToTakeValue1 = await this.client.database.Users.findOne({ id: user1.id }, { shipValue: 1, casado: 1, _id: 0 });
    const dbUserToTakeValue2 = await this.client.database.Users.findOne({ id: user2.id }, { shipValue: 1, _id: 0 });

    const FinalValue1 = dbUserToTakeValue1?.shipValue ? dbUserToTakeValue1.shipValue : Math.floor(Math.random() * 55);
    const FinalValue2 = dbUserToTakeValue2?.shipValue ? dbUserToTakeValue2.shipValue : Math.floor(Math.random() * 55);

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

    const name1 = (member1 && member1?.nickname) ? member1.nickname : user1.username;
    const name2 = (member2 && member2?.nickname) ? member2.nickname : user2.username;
    const mix = `${name1.substring(0, name1.length / 2) + name2.substring(name2.length / 2, name2.length)}`.replace(' ', '');

    const embed = new MessageEmbed()
      .setTitle(`${name1} + ${name2} = ${mix}`)
      .setDescription(`\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale('commands:ship.default')}`);

    if (!bufferedShipImage.err) {
      const attachment = new MessageAttachment(Buffer.from(bufferedShipImage.data), 'ship.png');
      embed.attachFiles(attachment)
        .setImage('attachment://ship.png');
    } else embed.setFooter(ctx.locale('commands:http-error'));

    if (Number(value) >= 25) embed.setColor('#cadf2a').setDescription(`\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale('commands:ship.low')}`);
    if (Number(value) >= 50) embed.setColor('#d8937b').setDescription(`\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale('commands:ship.ok')}`);
    if (Number(value) >= 75) embed.setColor('#f34a4a').setDescription(`\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale('commands:ship.medium')}`);
    if (Number(value) >= 99) embed.setColor('#ec2c2c').setDescription(`\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale('commands:ship.high')}`);
    if (Number(value) === 100) embed.setColor('#ff00df').setDescription(`\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale('commands:ship.perfect')}`);

    ctx.sendC(`${ctx.message.author}\n**${ctx.locale('commands:ship.message-start')}**`, embed);
  }
};
