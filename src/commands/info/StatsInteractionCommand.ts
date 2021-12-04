import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import moment from 'moment';
import { MessageEmbed, Client, MessageButton, EmbedFieldData } from 'discord.js-light';
import { COLORS, emojis } from '@structures/Constants';
import Util, { actionRow, disableComponents, getThemeById } from '@utils/Util';
import { Console } from 'node:console';
import { Transform } from 'node:stream';

export default class StatsInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'status',
      description: '「📊」・Veja os status de algo',
      options: [
        {
          name: 'blackjack',
          type: 'SUB_COMMAND',
          description: '「🃏」・Veja os status do blackjack de alguém',
          options: [
            {
              name: 'user',
              description: 'Usuário para ver os status',
              type: 'USER',
              required: false,
            },
          ],
        },
        {
          name: 'coinflip',
          description: '「💸」・Veja os status de coinflip de alguém',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Usuário para ver os status',
              type: 'USER',
              required: false,
            },
          ],
        },
        {
          name: 'cacar',
          description: '「🏹」・Veja os status de caças de alguem',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Usuário para ver os status',
              type: 'USER',
              required: false,
            },
          ],
        },
        {
          name: 'menhera',
          description: '「🧉」・Veja os status atuais da Menhera',
          type: 'SUB_COMMAND',
        },
        {
          name: 'design',
          description: '「🖌️」・Veja os status de design de algum designer',
          options: [
            {
              name: 'user',
              description: 'Designer que quer ver as informações',
              type: 'USER',
              required: false,
            },
          ],
          type: 'SUB_COMMAND',
        },
      ],
      category: 'info',
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand();

    switch (command) {
      case 'design':
        return StatsInteractionCommand.DesignerStatus(ctx);
      case 'cacar':
        return StatsInteractionCommand.HuntStatus(ctx);
      case 'coinflip':
        return StatsInteractionCommand.CoinflipStatus(ctx);
      case 'blackjack':
        return StatsInteractionCommand.BlackjackStatus(ctx);
      case 'menhera':
        return StatsInteractionCommand.MenheraStatus(ctx);
    }
  }

  static async DesignerStatus(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const userDesigns = await ctx.client.repositories.creditsRepository.getDesignerThemes(user.id);

    if (userDesigns.length === 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.designer.no-designer'),
        ephemeral: true,
      });
      return;
    }

    moment.locale(ctx.data.server.lang.toLowerCase());

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:status.designer.title', { user: user.tag }))
      .setColor(ctx.data.user.selectedColor)
      .addFields(
        userDesigns.reduce<EmbedFieldData[]>((fields, design) => {
          const theme = getThemeById(design.themeId);
          const fieldName = ctx.locale(`data:themes.${design.themeId as 1}.name`);
          const fieldDescription = ctx.locale('commands:status.designer.description', {
            sold: design.timesSold,
            profit: design.totalEarned,
            registered: moment(design.registeredAt).format('L'),
            royalty: design.royalty,
            type: theme.data.type,
            rarity: theme.data.rarity,
          });

          fields.push({ name: fieldName, value: fieldDescription, inline: true });
          return fields;
        }, []),
      );

    ctx.makeMessage({ embeds: [embed] });
  }

  static async HuntStatus(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getHuntUserStats(user.id);

    if (data.error) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.coinflip.error'),
        ephemeral: true,
      });
      return;
    }

    if (!data.user_id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.hunt.no-data'),
        ephemeral: true,
      });
      return;
    }

    const calculateSuccess = (sucesses: number, tries: number): string =>
      sucesses === 0 ? '0' : ((sucesses / tries) * 100).toFixed(1).replace('.0', '');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:status.hunt.embed-title', { user: user.tag }))
      .setColor(ctx.data.user.selectedColor)
      .addFields([
        {
          name: `${emojis.demons} | ${ctx.locale('commands:status.hunt.demon')}`,
          value: `${ctx.locale('commands:status.hunt.display-data', {
            tries: data.demon_tries,
            success: calculateSuccess(data.demon_success, data.demon_tries),
            hunted: data.demon_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.giants} | ${ctx.locale('commands:status.hunt.giant')}`,
          value: `${ctx.locale('commands:status.hunt.display-data', {
            tries: data.giant_tries,
            success: calculateSuccess(data.giant_success, data.giant_tries),
            hunted: data.giant_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.angels} | ${ctx.locale('commands:status.hunt.angel')}`,
          value: `${ctx.locale('commands:status.hunt.display-data', {
            tries: data.angel_tries,
            success: calculateSuccess(data.angel_success, data.angel_tries),
          })}`,
          inline: true,
        },
        {
          name: `${emojis.archangels} | ${ctx.locale('commands:status.hunt.archangel')}`,
          value: `${ctx.locale('commands:status.hunt.display-data', {
            tries: data.archangel_tries,
            success: calculateSuccess(data.archangel_success, data.archangel_tries),
            hunted: data.archangel_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.demigods} | ${ctx.locale('commands:status.hunt.demigod')}`,
          value: `${ctx.locale('commands:status.hunt.display-data', {
            tries: data.demigod_tries,
            success: calculateSuccess(data.demigod_success, data.demigod_tries),
            hunted: data.demigod_hunted,
          })}`,
          inline: true,
        },
        {
          name: `${emojis.gods} | ${ctx.locale('commands:status.hunt.god')}`,
          value: `${ctx.locale('commands:status.hunt.display-data', {
            tries: data.god_tries,
            success: calculateSuccess(data.god_success, data.god_tries),
            hunted: data.god_hunted,
          })}`,
          inline: true,
        },
      ]);

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async MenheraStatus(ctx: InteractionCommandContext): Promise<void> {
    if (!ctx.client.shard) return;
    const owner = await ctx.client.users.fetch(process.env.OWNER as string);

    moment.locale(ctx.data.server.lang.toLowerCase());

    if (!(await ctx.client.isShardingProcessEnded())) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:sharding_in_progress'),
      });
      return;
    }

    const results = await ctx.client.shard
      .broadcastEval((c: Client<true>) => {
        const guilds = c.guilds.cache.size;
        const memoryUsed = process.memoryUsage().heapUsed;

        return { guilds, memoryUsed };
      })
      .then((res) =>
        res.reduce(
          (p, c) => {
            p.guilds += c.guilds;
            p.memoryUsed += c.memoryUsed;

            return p;
          },
          { guilds: 0, memoryUsed: 0 },
        ),
      );

    const embed = new MessageEmbed()
      .setColor('#fa8dd7')
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setTitle(ctx.locale('commands:suporte.embed_title'))
      .setURL('https://discord.gg/fZMdQbA')
      .setDescription(
        ctx.locale('commands:status.botinfo.embed_description', {
          name: ctx.client.user?.username,
          createdAt: moment.utc(ctx.client.user?.createdAt).format('LLLL'),
          joinedAt: moment.utc(ctx.interaction?.guild?.me?.joinedAt).format('LLLL'),
        }),
      )
      .setFooter(
        `${ctx.client.user?.username} ${ctx.locale('commands:status.botinfo.embed_footer')} ${
          owner.tag
        }`,
        owner.displayAvatarURL({
          format: 'png',
          dynamic: true,
        }),
      )
      .addFields([
        {
          name: '🌐 | Servers | 🌐',
          value: `\`\`\`${results.guilds}\`\`\``,
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
          name: `<:memoryram:762817135394553876> | ${ctx.locale(
            'commands:status.botinfo.memory',
          )} | <:memoryram:762817135394553876>`,
          value: `\`\`\`${(results.memoryUsed / 1024 / 1024).toFixed(2)}MB\`\`\``,
          inline: true,
        },
        {
          name: `🇧🇷 | ${ctx.locale('commands:status.botinfo.version')} | 🇧🇷`,
          value: `\`\`\`${process.env.VERSION as string}\`\`\``,
          inline: true,
        },
        {
          name: '🏓 | Ping | 🏓',
          value: `📡 | ${ctx.locale('commands:ping.api')} **${
            Date.now() - ctx.interaction.createdTimestamp
          }ms**\n📡 | ${ctx.locale('commands:ping.latency')} **${Math.round(
            ctx.client.ws.ping,
          )}ms**\n🖲️ | Shard: **${ctx.client.shard.ids}** / **${ctx.client.shard.count - 1}**`,
          inline: false,
        },
      ]);

    const button = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | EXTENDED`)
      .setStyle('SECONDARY')
      .setLabel(ctx.locale('commands:status.botinfo.extended'));

    await ctx.makeMessage({ embeds: [embed], components: [actionRow([button])] });

    const clicked = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15000,
    );

    if (!clicked) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [button]))],
      });
      return;
    }

    const extendedShardsInfo = await ctx.client.shard.broadcastEval((c: Client<true>) => {
      const { ping, status } = c.ws;
      const { uptime } = c.ws.client;
      const guilds = c.guilds.cache.size;
      const memoryUsed = process.memoryUsage().heapUsed;

      return { ping, status, uptime, guilds, memoryUsed };
    });

    const tabled = extendedShardsInfo.reduce(
      (
        p: Array<{
          Ping: string;
          Status: string;
          Uptime: string;
          Ram: string;
          Guilds: number;
        }>,
        c,
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
          Ping: `${c.ping}ms`,
          Status: conninfo[c.status as keyof typeof conninfo],
          Uptime: moment.duration(c.uptime).format('D[d], H[h], m[m], s[s]'),
          Ram: `${(c.memoryUsed / 1024 / 1024).toFixed(2)} MB`,
          Guilds: c.guilds,
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
    await ctx.makeMessage({
      content: `\`\`\`${stringTable
        .replace('(index)', ' Shard ')
        .replace(/'/g, ' ')
        .slice(0, 1992)}\`\`\``,
      embeds: [],
      components: [],
    });
  }

  static async BlackjackStatus(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getBlackJackStats(user.id);

    if (data.error) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.coinflip.error'),
        ephemeral: true,
      });
      return;
    }

    if (!data.playedGames) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.blackjack.no-data'),
        ephemeral: true,
      });
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:status.blackjack.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter(ctx.locale('commands:status.coinflip.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${ctx.locale('commands:status.coinflip.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${ctx.locale('commands:status.coinflip.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${ctx.locale('commands:status.coinflip.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${ctx.locale('commands:status.coinflip.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${ctx.locale('commands:status.coinflip.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    // eslint-disable-next-line no-unused-expressions
    totalMoney > 0
      ? embed.addField(
          `${emojis.yes} | ${ctx.locale('commands:status.coinflip.profit')}`,
          `**${totalMoney}** :star:`,
          true,
        )
      : embed.addField(
          `${emojis.no} | ${ctx.locale('commands:status.coinflip.loss')}`,
          `**${totalMoney}** :star:`,
          true,
        );

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async CoinflipStatus(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getCoinflipUserStats(user.id);

    if (data.error) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.coinflip.error'),
      });
      return;
    }

    if (!data.playedGames) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.coinflip.no-data'),
      });
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:status.coinflip.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter(ctx.locale('commands:status.coinflip.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${ctx.locale('commands:status.coinflip.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${ctx.locale('commands:status.coinflip.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${ctx.locale('commands:status.coinflip.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${ctx.locale('commands:status.coinflip.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${ctx.locale('commands:status.coinflip.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    // eslint-disable-next-line no-unused-expressions
    totalMoney > 0
      ? embed.addField(
          `${emojis.yes} | ${ctx.locale('commands:status.coinflip.profit')}`,
          `**${totalMoney}** :star:`,
          true,
        )
      : embed.addField(
          `${emojis.no} | ${ctx.locale('commands:status.coinflip.loss')}`,
          `**${totalMoney}** :star:`,
          true,
        );

    await ctx.makeMessage({ embeds: [embed] });
  }
}
