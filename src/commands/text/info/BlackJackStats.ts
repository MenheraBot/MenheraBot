/* eslint-disable no-unused-expressions */
import { ColorResolvable, MessageEmbed } from 'discord.js';

import http from '@utils/HTTPrequests';

import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import { emojis } from '@structures/MenheraConstants';
import CommandContext from '@structures/CommandContext';

export default class BlackJackStatsCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blackjackstats',
      aliases: ['bjs'],
      cooldown: 5,
      category: 'info',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const userDb = await this.client.repositories.userRepository.find(
      ctx.args[0] ? ctx.args[0].replace(/[<@!>]/g, '') : ctx.message.author.id,
    );
    if (!userDb) {
      await ctx.replyT('error', 'commands:coinflipstats.error');
      return;
    }
    const data = await http.getBlackJackStats(userDb ? userDb.id : ctx.message.author.id);
    if (data?.error) {
      await ctx.replyT('error', 'commands:coinflipstats.error');
      return;
    }
    if (!data || !data.playedGames) {
      await ctx.replyT('error', 'commands:blackjackstats.no-data');
      return;
    }

    const totalMoney = data.winMoney - data.lostMoney;

    const userName = await this.client.users.fetch(userDb ? userDb.id : ctx.message.author.id);

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:blackjackstats.embed-title', { user: userName.tag }))
      .setColor(userDb.cor as ColorResolvable)
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

    await ctx.sendC(ctx.message.author.toString(), embed);
  }
}
