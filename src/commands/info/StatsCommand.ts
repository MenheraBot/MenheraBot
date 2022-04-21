import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import moment from 'moment';
import { MessageEmbed, MessageButton, EmbedFieldData } from 'discord.js-light';
import { COLORS, emojis } from '@structures/Constants';
import Util, { actionRow, disableComponents, getThemeById } from '@utils/Util';

export default class StatsCommand extends InteractionCommand {
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
          name: 'roleta',
          type: 'SUB_COMMAND',
          description: '「🎡」・Veja os status de roleta de alguém',
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
          name: 'designer',
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
      case 'designer':
        return StatsCommand.DesignerStatus(ctx);
      case 'cacar':
        return StatsCommand.HuntStatus(ctx);
      case 'coinflip':
        return StatsCommand.CoinflipStatus(ctx);
      case 'blackjack':
        return StatsCommand.BlackjackStatus(ctx);
      case 'roleta':
        return StatsCommand.RouletteStatus(ctx);
    }
  }

  static async RouletteStatus(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    const data = await HttpRequests.getRouletteUserStats(user.id);

    if (data.error) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.coinflip.error'),
      });
      return;
    }

    if (!data.playedGames) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:status.roleta.no-data'),
      });
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:status.roleta.embed-title', { user: user.tag }))
      .setColor(COLORS.Purple)
      .setFooter({ text: ctx.locale('commands:status.coinflip.embed-footer') })
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
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
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

    if (ctx.author.id !== user.id) {
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const { notifyPurchase } = await ctx.client.repositories.themeRepository.findOrCreate(user.id, [
      'notifyPurchase',
    ]);

    embed.setFooter({ text: ctx.locale('commands:status.designer.notify-footer') });

    const notifyButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NOTIFY`)
      .setEmoji('<:notify:759607330597502976>')
      .setStyle(notifyPurchase ? 'PRIMARY' : 'SECONDARY')
      .setLabel(
        ctx.locale(`commands:status.designer.${notifyPurchase ? 'notify' : 'dont-notify'}`),
      );

    ctx.makeMessage({ embeds: [embed], components: [actionRow([notifyButton])] });

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7500,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [notifyButton]))],
      });
      return;
    }

    await ctx.client.repositories.themeRepository.makeNofity(ctx.author.id, !notifyPurchase);

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:status.designer.success'),
    });
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
            hunted: data.angel_hunted,
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
      .setFooter({ text: ctx.locale('commands:status.coinflip.embed-footer') })
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
      .setFooter({ text: ctx.locale('commands:status.coinflip.embed-footer') })
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
