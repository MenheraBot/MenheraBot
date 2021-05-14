const { MessageEmbed } = require('discord.js');
const table = require('string-table');
const moment = require('moment');
const Command = require('../../structures/command');
require('moment-duration-format');

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

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setTitle('🏓 | Pong!')
        .setDescription(`📡 | ${t('commands:ping.api')} **${Date.now() - message.createdTimestamp}ms**\n📡 | ${t('commands:ping.latency')} **${Math.round(this.client.ws.ping)}ms**\n🖲️ | Shard: **${this.client.shard.ids}** / **${this.client.shard.count - 1}**`)
        .setFooter(message.author.tag, avatar)
        .setTimestamp()
        .setColor('#eab3fa');

      return message.channel.send(embed);
    }
    const allShardsInformation = await this.client.shard.broadcastEval('this.ws');
    const allShardsUptime = await this.client.shard.broadcastEval('this.ws.client.uptime');

    const tabled = allShardsInformation.reduce((p, c, n) => {
      const conninfo = {
        0: 'READY',
        1: 'CONNECTING',
        2: 'RECONNECTING',
        3: 'IDLE',
        4: 'NEARLY',
        5: 'DISCONNECTED',
        6: 'WAITING_FOR_GUILDS',
        7: 'IDENTIFYING',
        8: 'RESUMING',
      };
      p.push({
        Shard: c.shards[0].id,
        Ping: `${c.shards[0].ping}ms`,
        Status: conninfo[c.shards[0].status],
        Uptime: moment.duration(allShardsUptime[n]).format('D[d], H[h], m[m], s[s]'),
      });
      return p;
    }, []);

    message.channel.send(`\`\`\`${table.create(tabled)}\`\`\``);
  }
};
