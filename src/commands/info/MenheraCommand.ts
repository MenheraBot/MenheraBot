import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { Console } from 'node:console';
import { Transform } from 'node:stream';
import MenheraClient from 'MenheraClient';
import moment from 'moment';
import { MessageButton, MessageEmbed, ShardClientUtil } from 'discord.js-light';
import Util, { actionRow, disableComponents } from '@utils/Util';

export default class MenheraCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'menhera',
      description: '「✨」・Information regarding Menhera',
      descriptionLocalizations: { 'pt-BR': '「✨」・Informações referentes à Menhera' },
      category: 'info',
      options: [
        {
          name: 'statistics',
          nameLocalizations: { 'pt-BR': 'estatísticas' },
          description: "「🤖」・See Menhera's current stats",
          descriptionLocalizations: { 'pt-BR': '「🤖」・Veja as estatísticas atuais da Menhera' },
          type: 'SUB_COMMAND',
        },
      ],
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);

    if (command === 'statistics') return MenheraCommand.MenheraStatistics(ctx);
  }

  static async MenheraStatistics(ctx: InteractionCommandContext): Promise<void> {
    const owner = await ctx.client.users.fetch(process.env.OWNER as string);

    moment.locale(ctx.data.server.lang.toLowerCase());

    if (!ctx.client.shardProcessEnded) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:sharding_in_progress'),
      });
      return;
    }

    // @ts-expect-error Client n é sexual
    const clustersInfo = await ctx.client.cluster.broadcastEval((c: MenheraClient) => {
      const { ping, status } = c.ws;
      const { uptime } = c;
      const guilds = c.guilds.cache.size;
      const memoryUsed = process.memoryUsage().rss;
      const clusterId = c.cluster.id;

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

      return {
        Ping: ping,
        Status: conninfo[status as keyof typeof conninfo],
        Uptime: uptime,
        Guilds: guilds,
        Ram: memoryUsed,
        ClusterId: clusterId,
      };
    });

    const totalServersAndmemory = clustersInfo.reduce(
      (p, c) => {
        p.guilds += c.Guilds;
        p.memory += c.Ram;
        return p;
      },
      { guilds: 0, memory: 0 },
    );

    const embed = new MessageEmbed()
      .setColor('#fa8dd7')
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setDescription(
        ctx.locale('commands:menhera.estatisticas.embed_description', {
          name: ctx.client.user?.username,
          createdAt: moment.utc(ctx.client.user?.createdAt).format('LLLL'),
          joinedAt: moment.utc(ctx.interaction?.guild?.me?.joinedAt).format('LLLL'),
        }),
      )
      .setFooter({
        text: ctx.locale('commands:menhera.estatisticas.embed_footer', {
          menhera: ctx.client.user.username,
          owner: owner.tag,
        }),
        iconURL: owner.displayAvatarURL({
          format: 'png',
          dynamic: true,
        }),
      })
      .addFields([
        {
          name: '🌐 | Servers | 🌐',
          value: `\`\`\`${totalServersAndmemory.uilds}\`\`\``,
          inline: true,
        },
        {
          name: '⏳ | Uptime | ⏳',
          value: `\`\`\`${moment
            .duration(ctx.client.uptime)
            .format('D[d], H[h], m[m], s[s]')}\`\`\``,
          inline: true,
        },
        {
          name: `📊 | Ram | 📊`,
          value: `\`\`\`${
            Math.round((totalServersAndmemory.memory / 1024 / 1024) * 100) / 100
          }MB\`\`\``,
          inline: true,
        },
        {
          name: `🇧🇷 | ${ctx.locale('commands:menhera.estatisticas.version')} | 🇧🇷`,
          value: `\`\`\`${process.env.VERSION}\`\`\``,
          inline: true,
        },
        {
          name: '🏓 | Ping | 🏓',
          value: ctx.locale('commands:menhera.estatisticas.ping', {
            api: Date.now() - ctx.interaction.createdTimestamp,
            ws: ctx.client.ws.ping,
            shard: ShardClientUtil.shardIdForGuildId(
              ctx.interaction.guildId ?? '',
              ctx.client.options.shardCount ?? 0,
            ),
            totalShard: ctx.client.options.shardCount ?? 0,
            cluster: ctx.client.cluster.id,
            totalCluster: ctx.client.cluster.count,
          }),
          inline: false,
        },
      ]);

    const today = new Date();
    const menheraAniversary = ctx.client.user.createdAt;

    if (
      today.getDate() === menheraAniversary.getDate() &&
      today.getMonth() === menheraAniversary.getMonth()
    )
      embed.setTitle(ctx.locale('commands:menhera.estatisticas.aniversary-title'));

    const button = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | EXTENDED`)
      .setStyle('SECONDARY')
      .setLabel(ctx.locale('commands:menhera.estatisticas.extended'));

    const support = new MessageButton()
      .setStyle('LINK')
      .setURL('https://discord.gg/fZMdQbA')
      .setLabel(ctx.locale('commands:menhera.estatisticas.support'));

    const site = new MessageButton()
      .setStyle('LINK')
      .setURL('https://menherabot.xyz')
      .setLabel('WebSite');

    await ctx.makeMessage({ embeds: [embed], components: [actionRow([button, support, site])] });

    const clicked = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15000,
    );

    if (!clicked) {
      ctx.makeMessage({
        components: [
          actionRow([...disableComponents(ctx.locale('common:timesup'), [button]), support, site]),
        ],
      });
      return;
    }

    const clusterData = clustersInfo.map((a) => ({
      ...a,
      Ram: `${Math.round((a.Ram / 1024 / 1024) * 100) / 100}MB`,
      Ping: `${a.Ping}ms`,
      Uptime: moment.duration(a.Uptime).format('D[d], H[h], m[m], s[s]'),
    }));

    const ts = new Transform({
      transform(chunk, _, cb) {
        cb(null, chunk);
      },
    });

    const logger = new Console({ stdout: ts });
    logger.table(clusterData);

    ctx.makeMessage({
      content: `\`\`\`${(ts.read() || '')
        .toString()
        .replace('(index)', 'Cluster')
        .replace(/'/g, ' ')
        .slice(0, 1992)}\`\`\``,
      embeds: [],
      components: [actionRow([support, site])],
    });
  }
}
