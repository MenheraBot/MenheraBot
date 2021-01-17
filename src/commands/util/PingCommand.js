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

  async run({ message, args }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (args[0] === 'shard' || args[0] === 'shards') {
      this.client.shard.broadcastEval('this.ws.ping').then((shard) => {
        const embed = new MessageEmbed()
          .setColor('#eab3fa')
          .setFooter(message.author.tag, avatar);
        shard.forEach((ping, index) => embed.addField(`Shard **${index}**`, `**${Math.round(ping)}**ms`, true));
        return message.channel.send(embed);
      });
    } else {
      const embed = new MessageEmbed()
        .setTitle('🏓 | Pong!')
        .setDescription(`📡 | ${t('commands:ping.api')} **${Date.now() - message.createdTimestamp}ms**\n📡 | ${t('commands:ping.latency')} **${Math.round(this.client.ws.ping)}ms**\n🖲️ | ShardId: [**${this.client.shard.ids}**/${this.client.shard.count - 1}]`)
        .setFooter(message.author.tag, avatar)
        .setTimestamp()
        .setColor('#eab3fa');

      return message.channel.send(embed);
    }
  }
};
