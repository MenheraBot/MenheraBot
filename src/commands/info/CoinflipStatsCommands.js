/* eslint-disable no-unused-expressions */
const { MessageEmbed } = require('discord.js');
const http = require('../../utils/HTTPrequests');
const Command = require('../../structures/command');

/* const returnObject = {
  playedGames,
  lostGames,
  winGames,
  winMoney,
  lostMoney,
  winPorcentage,
  lostPorcentage,
}; */

module.exports = class CoinflipStatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'coinflipstats',
      aliases: ['cfs'],
      cooldown: 5,
      category: 'info',
    });
  }

  async run({ message }, t) {
    const data = await http.getCoinflipUserStats(message.author.id);
    if (data.error) return message.menheraReply('error', t('commands:coinflipstats.error'));
    if (!data || !data.playedGames || data.playedGames === undefined) return message.menheraReply('error', t('commands:coinflipstats.no-data'));

    const totalMoney = data.winMoney - data.lostMoney;

    const embed = new MessageEmbed()
      .setTitle(t('commands:coinflipstats.embed-title', { user: message.author.username }))
      .setColor('#48a6fe')
      .setFooter(t('commands:coinflipstats.embed-footer'))
      .addFields([
        {
          name: `🎰 | ${t('commands:coinflipstats.played')}`,
          value: `**${data.playedGames}**`,
          inline: true,
        },
        {
          name: `🏆 | ${t('commands:coinflipstats.wins')}`,
          value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `🦧 | ${t('commands:coinflipstats.loses')}`,
          value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
          inline: true,
        },
        {
          name: `📥 | ${t('commands:coinflipstats.earnMoney')}`,
          value: `**${data.winMoney}** :star:`,
          inline: true,
        },
        {
          name: `📤 | ${t('commands:coinflipstats.lostMoney')}`,
          value: `**${data.lostMoney}** :star:`,
          inline: true,
        },
      ]);
    totalMoney > 0 ? embed.addField(`✅ | ${t('commands:coinflipstats.profit')}`, `**${totalMoney}** :star:`, true) : embed.addField(`❌ | ${t('commands:coinflipstats.loss')}`, `**${totalMoney}** :star:`, true);

    message.channel.send(message.author, embed);
  }
};
