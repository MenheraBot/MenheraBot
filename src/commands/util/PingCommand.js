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

    let embed;

    if (args[0] === 'shard' || args[0] === 'shards') {
      this.client.shard.broadcastEval('this.ws.ping').then((shard) => {
        embed = new MessageEmbed()
          .setColor('#eab3fa')
          .setFooter(`${t('commands:ping')} ${this.client.shard.count} shards`);
        shard.forEach((ping, index) => embed.addField(`Shard **${index}**`, `**${Math.round(ping)}**ms`, true));
        message.channel.send(embed);
      });
    } else {
      embed = new MessageEmbed()
        .setTitle('🏓 | Pong!')
        .setDescription(`📡 | ${t('commands:ping.api')} **${Date.now() - message.createdTimestamp}ms**\n📡 | ${t('commands:ping.latency')} **${Math.round(this.client.ws.ping)}ms**\n🖲️ | ShardId: [**${this.client.shard.ids}**/${this.client.shard.count}]`)
        .setFooter(message.author.tag, avatar)
        .setTimestamp()
        .setColor('#eab3fa');
    }

    message.channel.send(embed);
  }
};
