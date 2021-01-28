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

  async run({ message, args }, t) {
    const userDb = args[0] ? await this.client.database.Users.findOne({ id: args[0].replace(/[<@!>]/g, '') }) : message.author;
    const data = await http.getCoinflipUserStats(userDb ? userDb.id : message.author.id);
    if (data.error) return message.menheraReply('error', t('commands:coinflipstats.error'));
    if (!data || !data.playedGames || data.playedGames === undefined) return message.menheraReply('error', t('commands:coinflipstats.no-data'));

    const totalMoney = data.winMoney - data.lostMoney;

    const userName = await this.client.users.fetch(userDb ? userDb.id : message.author.id);

    const embed = new MessageEmbed()
      .setTitle(t('commands:coinflipstats.embed-title', { user: userName.tag }))
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
