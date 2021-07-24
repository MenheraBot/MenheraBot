import { MessageEmbed } from 'discord.js';
import table from 'string-table';
import moment from 'moment';
import Command from '@structures/Command';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class PingCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ping',
      cooldown: 5,
      category: 'info',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext) {
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!ctx.args[0]) {
      const embed = new MessageEmbed()
        .setTitle('🏓 | Pong!')
        .setDescription(
          `📡 | ${ctx.locale('commands:ping.api')} **${
            Date.now() - ctx.message.createdTimestamp
          }ms**\n📡 | ${ctx.locale('commands:ping.latency')} **${Math.round(
            this.client.ws.ping,
          )}ms**\n🖲️ | Shard: **${this.client.shard.ids}** / **${this.client.shard.count - 1}**`,
        )
        .setFooter(ctx.message.author.tag, avatar)
        .setTimestamp()
        .setColor('#eab3fa');

      return ctx.send(embed);
    }
    const allShardsInformation = await this.client.shard.broadcastEval('this.ws');
    const allShardsUptime = await this.client.shard.broadcastEval('this.ws.client.uptime');
    const guildsPerShardCount = await this.client.shard.broadcastEval('this.guilds.cache.size');
    const allShardsMemoryUsedByProcess = await this.client.shard.broadcastEval(
      'process.memoryUsage().heapUsed',
    );

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
        Ram: `${(allShardsMemoryUsedByProcess[n] / 1024 / 1024).toFixed(2)} MB`,
        Guilds: guildsPerShardCount[n],
      });
      return p;
    }, []);

    ctx.send(`\`\`\`${table.create(tabled)}\`\`\``);
  }
}
