import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '@structures/Command';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { IShardArrayFromWs } from '@utils/Types';
import { Console } from 'console';
import { Transform } from 'stream';

export default class PingCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ping',
      cooldown: 5,
      category: 'info',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (!this.client.shard) return;
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

      await ctx.send(embed);
      return;
    }
    const allShardsInformation: Array<IShardArrayFromWs> = await this.client.shard.broadcastEval(
      'this.ws',
    );
    const allShardsUptime: Array<number> = await this.client.shard.broadcastEval(
      'this.ws.client.uptime',
    );
    const guildsPerShardCount: Array<number> = await this.client.shard.broadcastEval(
      'this.guilds.cache.size',
    );
    const allShardsMemoryUsedByProcess: Array<number> = await this.client.shard.broadcastEval(
      'process.memoryUsage().heapUsed',
    );

    const tabled = allShardsInformation.reduce(
      (
        p: Array<{
          Ping: string;
          Status: string;
          Uptime: string;
          Ram: string;
          Guilds: number;
        }>,
        c,
        n,
      ) => {
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

        const FirstShard = c.shards[0];
        p.push({
          Ping: `${FirstShard.ping}ms`,
          Status: conninfo[FirstShard.status],
          Uptime: moment.duration(allShardsUptime[n]).format('D[d], H[h], m[m], s[s]'),
          Ram: `${(allShardsMemoryUsedByProcess[n] / 1024 / 1024).toFixed(2)} MB`,
          Guilds: guildsPerShardCount[n],
        });
        return p;
      },
      [],
    );

    const ts = new Transform({
      transform(chunk, _, cb) {
        cb(null, chunk);
      },
    });
    const logger = new Console({ stdout: ts });

    function getTable(data: typeof tabled) {
      logger.table(data);
      return (ts.read() || '').toString();
    }

    const stringTable = getTable(tabled);
    await ctx.sendC(`\`\`\`${stringTable.replace('(index)', ' Shard ')}\`\`\``, {
      split: { prepend: '```\n', append: '```' },
    });
  }
}
