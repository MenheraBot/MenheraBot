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

  async run(ctx) {
    const userRpg = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!ctx.data.user) return ctx.replyT('error', 'commands:cooldowns.error');

    const huntCooldownInMilis = parseInt(ctx.data.user?.caçarTime) - Date.now();
    const dungeonCooldownInMilis = userRpg ? (parseInt(userRpg.dungeonCooldown) - Date.now()) : false;
    const jobCooldownInMilis = userRpg ? (parseInt(userRpg.jobCooldown) - Date.now()) : false;
    const voteCooldownInMilis = parseInt(ctx.data.user?.voteCooldown) - Date.now();

    let txt = '';

    huntCooldownInMilis < 0 ? txt += `\`${ctx.locale('commands:cooldowns.hunt')}\` | ${ctx.locale('commands:cooldowns.no-cooldown')}\n` : txt += `\`${ctx.locale('commands:cooldowns.hunt')}\` | **${moment.utc(huntCooldownInMilis).format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}\n`;
    dungeonCooldownInMilis && dungeonCooldownInMilis < 0 ? txt += `\`${ctx.locale('commands:cooldowns.dungeon')}\` | ${ctx.locale('commands:cooldowns.no-cooldown')}\n` : txt += `\`${ctx.locale('commands:cooldowns.dungeon')}\` | **${moment.utc(dungeonCooldownInMilis).format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}\n`;
    jobCooldownInMilis && jobCooldownInMilis < 0 ? txt += `\`${ctx.locale('commands:cooldowns.job')}\` | ${ctx.locale('commands:cooldowns.no-cooldown')}\n` : txt += `\`${ctx.locale('commands:cooldowns.job')}\` | ${jobCooldownInMilis > 3600000 ? `**${moment.utc(jobCooldownInMilis).format('HH:mm:ss')}** ${ctx.locale('commands:cooldowns.hours')}\n` : `**${moment.utc(jobCooldownInMilis).format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}`}\n`;
    voteCooldownInMilis && voteCooldownInMilis < 0 ? txt += `\`${ctx.locale('commands:cooldowns.vote')}\` | ${ctx.locale('commands:cooldowns.no-cooldown')}\n` : txt += `\`${ctx.locale('commands:cooldowns.vote')}\` | ${voteCooldownInMilis > 3600000 ? `**${moment.utc(voteCooldownInMilis).format('HH:mm:ss')}** ${ctx.locale('commands:cooldowns.hours')}\n` : `**${moment.utc(voteCooldownInMilis).format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}`}\n`;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:cooldowns.title'))
      .setColor('#6597df')
      .setDescription(txt);

    ctx.sendC(ctx.message.author, embed);
  }
};
