const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle('🏓 | Pong!')
      .setDescription(`📡 | ${t('commands:ping.api')} **${Date.now() - message.createdTimestamp}ms**\n📡 | ${t('commands:ping.latency')} **${Math.round(this.client.ws.ping)}ms**`)
      .setFooter(message.author.tag, avatar)
      .setTimestamp()
      .setColor('#eab3fa');

    message.channel.send(embed);
  }
};
