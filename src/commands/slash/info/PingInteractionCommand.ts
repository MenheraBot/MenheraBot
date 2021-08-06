import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import { Console } from 'console';
import { Transform } from 'stream';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class PingInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ping',
      description: '「📡」・Mostra o ping do bot',
      options: [
        {
          name: 'shards',
          type: 3,
          description: 'Mostra as informações de todas as Shards',
          required: false,
        },
      ],
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (!this.client.shard) return;
    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    if (ctx.args[0] && ctx.args[0].value) {
      const allShardsPing = (await this.client.shard.fetchClientValues('ws.ping')) as number[];
      const allShardsStatus = (await this.client.shard.fetchClientValues('ws.status')) as number[];
      const allShardsUptime = (await this.client.shard.fetchClientValues(
        'ws.client.uptime',
      )) as number[];
      const guildsPerShardCount = (await this.client.shard.fetchClientValues(
        'guilds.cache.size',
      )) as number[];
      const allShardsMemoryUsedByProcess: Array<number> = (await this.client.shard.broadcastEval(
        () => process.memoryUsage().heapUsed,
      )) as number[];
      const tabled = allShardsPing.reduce(
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
          p.push({
            Ping: `${c}ms`,
            Status: conninfo[allShardsStatus[n] as keyof typeof conninfo],
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

      const getTable = (data: typeof tabled) => {
        logger.table(data);
        return (ts.read() || '').toString();
      };

      const stringTable = getTable(tabled);
      await ctx.reply(
        `\`\`\`${stringTable
          .replace('(index)', ' Shard ')
          .replace(/'/g, ' ')
          .slice(0, 1992)}\`\`\``,
      );
      return;
    }
    const embed = new MessageEmbed()
      .setTitle('🏓 | Pong!')
      .setDescription(
        `📡 | ${ctx.locale('commands:ping.api')} **${
          Date.now() - ctx.interaction.createdTimestamp
        }ms**\n📡 | ${ctx.locale('commands:ping.latency')} **${Math.round(
          this.client.ws.ping,
        )}ms**\n🖲️ | Shard: **${this.client.shard.ids}** / **${this.client.shard.count - 1}**`,
      )
      .setFooter(ctx.interaction.user.tag, avatar)
      .setTimestamp()
      .setColor('#eab3fa');

    await ctx.reply({ embeds: [embed] });
  }
}
