/* eslint-disable no-unused-expressions */
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../structures/command');

module.exports = class CooldownsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cooldowns',
      aliases: ['recargas', 'cooldowns', 'cd'],
      cooldown: 10,
      category: 'info',
    });
  }

  async run({ message, authorData }, t) {
    const userRpg = await this.client.database.Rpg.findById(message.author.id);
    // eslint-disable-next-line no-param-reassign
    if (!authorData) return message.menheraReply('error', t('commands:cooldowns.error'));

    const huntCooldownInMilis = parseInt(authorData?.caçarTime) - Date.now();
    const dungeonCooldownInMilis = userRpg ? (parseInt(userRpg.dungeonCooldown) - Date.now()) : null;
    const jobCooldownInMilis = userRpg ? (parseInt(userRpg.jobCooldown) - Date.now()) : null;
    const voteCooldownInMilis = parseInt(authorData?.voteCooldown) - Date.now();

    let txt = '';

    huntCooldownInMilis < 0 ? txt += `\`${t('commands:cooldowns.hunt')}\` | ${t('commands:cooldowns.no-cooldown')}\n` : txt += `\`${t('commands:cooldowns.hunt')}\` | **${moment.utc(huntCooldownInMilis).format('mm:ss')}** ${t('commands:cooldowns.minutes')}\n`;
    dungeonCooldownInMilis && dungeonCooldownInMilis < 0 ? txt += `\`${t('commands:cooldowns.dungeon')}\` | ${t('commands:cooldowns.no-cooldown')}\n` : txt += `\`${t('commands:cooldowns.dungeon')}\` | **${moment.utc(dungeonCooldownInMilis).format('mm:ss')}** ${t('commands:cooldowns.minutes')}\n`;
    jobCooldownInMilis && jobCooldownInMilis < 0 ? txt += `\`${t('commands:cooldowns.job')}\` | ${t('commands:cooldowns.no-cooldown')}\n` : txt += `\`${t('commands:cooldowns.job')}\` | ${jobCooldownInMilis > 3600000 ? `**${moment.utc(jobCooldownInMilis).format('HH:mm:ss')}** ${t('commands:cooldowns.hours')}\n` : `**${moment.utc(jobCooldownInMilis).format('mm:ss')}** ${t('commands:cooldowns.minutes')}`}\n`;
    voteCooldownInMilis && voteCooldownInMilis < 0 ? txt += `\`${t('commands:cooldowns.vote')}\` | ${t('commands:cooldowns.no-cooldown')}\n` : txt += `\`${t('commands:cooldowns.vote')}\` | ${voteCooldownInMilis > 3600000 ? `**${moment.utc(voteCooldownInMilis).format('HH:mm:ss')}** ${t('commands:cooldowns.hours')}\n` : `**${moment.utc(voteCooldownInMilis).format('mm:ss')}** ${t('commands:cooldowns.minutes')}`}\n`;

    const embed = new MessageEmbed()
      .setTitle(t('commands:cooldowns.title'))
      .setColor('#6597df')
      .setDescription(txt);

    message.channel.send(message.author, embed);
  }
};
