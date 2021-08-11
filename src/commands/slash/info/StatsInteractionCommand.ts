import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import moment from 'moment';
import { MessageEmbed } from 'discord.js';
import { COLORS, emojis } from '@structures/MenheraConstants';

export default class StatsInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
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
          name: 'menhera',
          description: '「🧉」・Veja os status atuais da Menhera',
          type: 'SUB_COMMAND',
        },
      ],
      category: 'info',
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.args[0].name;

    switch (type) {
      case 'coinflip':
        return StatsInteractionCommand.coinflip(ctx);
      case 'blackjack':
        return StatsInteractionCommand.blackjack(ctx);
      case 'menhera':
        return this.menhera(ctx);
    }
  }

  async menhera(ctx: InteractionCommandContext): Promise<void> {
    const owner = await this.client.users.fetch(process.env.OWNER as string);
    if (ctx.data.server.lang === 'pt-BR') {
      moment.locale('pt-br');
    } else moment.locale('en-us');
    if (!this.client.shard) return;

    const promises = [
      this.client.shard.fetchClientValues('guilds.cache.size'),
      this.client.shard.fetchClientValues('channels.cache.size'),
      this.client.shard.broadcastEval((c) =>
        c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      ),
      this.client.shard.broadcastEval(() => process.memoryUsage().heapUsed),
    ];

    const getReduced = (arr: number[]) => arr.reduce((p, c) => p + c, 0);

    const [AllGuilds, AllChannels, AllMembers, AllMemoryUsed] = (await Promise.all(promises)) as [
      AllGuild: number[],
      AllChannels: number[],
      AllMembers: number[],
      AllMemoryUsed: number[],
    ];

    const embed = new MessageEmbed()
      .setColor('#fa8dd7')
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setDescription(
        ctx.locale('commands:botinfo.embed_description', {
          name: this.client.user?.username,
          createdAt: moment.utc(this.client.user?.createdAt).format('LLLL'),
          joinedAt: moment.utc(ctx.interaction?.guild?.me?.joinedAt).format('LLLL'),
        }),
      )
      .setFooter(
        `${this.client.user?.username} ${ctx.locale('commands:botinfo.embed_footer')} ${owner.tag}`,
        owner.displayAvatarURL({
          format: 'png',
          dynamic: true,
        }),
      )
      .addFields([
        {
          name: '🌐 | Servers | 🌐',
          value: `\`\`\`${getReduced(AllGuilds)}\`\`\``,
          inline: true,
        },
        {
          name: `🗄️ | ${ctx.locale('commands:botinfo.channels')} | 🗄️`,
          value: `\`\`\`${getReduced(AllChannels)}\`\`\``,
          inline: true,
        },
        {
          name: `👥 | ${ctx.locale('commands:botinfo.users')} | 👥`,
          value: `\`\`\`${getReduced(AllMembers)}\`\`\``,
          inline: true,
        },
        {
          name: '⏳ | Uptime | ⏳',
          value: `\`\`\`${moment
            .duration(this.client.uptime)
            .format('D[d], H[h], m[m], s[s]')}\`\`\``,
          inline: true,
        },
        {
          name: `<:memoryram:762817135394553876> | ${ctx.locale(
            'commands:botinfo.memory',
          )} | <:memoryram:762817135394553876>`,
          value: `\`\`\`${(getReduced(AllMemoryUsed) / 1024 / 1024).toFixed(2)}MB\`\`\``,
          inline: true,
        },
      ]);
    await ctx.reply({ embeds: [embed] });
  }

  static async blackjack(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;

    const data = await HttpRequests.getBlackJackStats(user.id);

    if (data.error) {
      await ctx.replyT('error', 'commands:coinflipstats.error', {}, true);
      return;
    }

    if (!data.playedGames) {
      await ctx.replyT('error', 'commands:blackjackstats.no-data', {}, true);
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:blackjackstats.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter(ctx.locale('commands:coinflipstats.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${ctx.locale('commands:coinflipstats.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${ctx.locale('commands:coinflipstats.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${ctx.locale('commands:coinflipstats.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${ctx.locale('commands:coinflipstats.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${ctx.locale('commands:coinflipstats.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    // eslint-disable-next-line no-unused-expressions
    totalMoney > 0
      ? embed.addField(
          `${emojis.yes} | ${ctx.locale('commands:coinflipstats.profit')}`,
          `**${totalMoney}** :star:`,
          true,
        )
      : embed.addField(
          `${emojis.no} | ${ctx.locale('commands:coinflipstats.loss')}`,
          `**${totalMoney}** :star:`,
          true,
        );

    await ctx.reply({ embeds: [embed] });
  }

  static async coinflip(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;

    const data = await HttpRequests.getCoinflipUserStats(user.id);

    if (data.error) {
      await ctx.replyT('error', 'commands:coinflipstats.error');
      return;
    }

    if (!data.playedGames) {
      await ctx.replyT('error', 'commands:coinflipstats.no-data');
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:coinflipstats.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter(ctx.locale('commands:coinflipstats.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${ctx.locale('commands:coinflipstats.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${ctx.locale('commands:coinflipstats.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${ctx.locale('commands:coinflipstats.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${ctx.locale('commands:coinflipstats.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${ctx.locale('commands:coinflipstats.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    // eslint-disable-next-line no-unused-expressions
    totalMoney > 0
      ? embed.addField(
          `${emojis.yes} | ${ctx.locale('commands:coinflipstats.profit')}`,
          `**${totalMoney}** :star:`,
          true,
        )
      : embed.addField(
          `${emojis.no} | ${ctx.locale('commands:coinflipstats.loss')}`,
          `**${totalMoney}** :star:`,
          true,
        );

    await ctx.reply({ embeds: [embed] });
  }
}
