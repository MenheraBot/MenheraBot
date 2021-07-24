/* eslint-disable no-unused-expressions */
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class CooldownsCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'cooldowns',
      aliases: ['recargas', 'cooldowns', 'cd'],
      cooldown: 10,
      category: 'info',
    });
  }

  async run(ctx: CommandContext) {
    const userRpg = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!ctx.data.user) return ctx.replyT('error', 'commands:cooldowns.error');

    const huntCooldownInMilis = parseInt(ctx.data.user?.caçarTime) - Date.now();
    const dungeonCooldownInMilis = userRpg ? parseInt(userRpg.dungeonCooldown) - Date.now() : 0;
    const jobCooldownInMilis = userRpg ? parseInt(userRpg.jobCooldown) - Date.now() : 0;
    const deathTimeInMilis = userRpg ? parseInt(userRpg.death) - Date.now() : 0;
    const hotelTimeInMilis = userRpg ? parseInt(userRpg.hotelTime) - Date.now() : 0;
    const voteCooldownInMilis = parseInt(ctx.data.user?.voteCooldown) - Date.now();

    let txt = '';

    huntCooldownInMilis < 0
      ? (txt += `\`${ctx.locale('commands:cooldowns.hunt')}\` | ${ctx.locale(
          'commands:cooldowns.no-cooldown',
        )}\n`)
      : (txt += `\`${ctx.locale('commands:cooldowns.hunt')}\` | **${moment
          .utc(huntCooldownInMilis)
          .format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}\n`);
    if (userRpg) {
      if (deathTimeInMilis > 0)
        txt += `\`${ctx.locale('commands:cooldowns.death')}\` | ${
          deathTimeInMilis > 3600000
            ? `**${moment.utc(deathTimeInMilis).format('HH:mm:ss')}** ${ctx.locale(
                'commands:cooldowns.hours',
              )}`
            : `**${moment.utc(deathTimeInMilis).format('mm:ss')}** ${ctx.locale(
                'commands:cooldowns.minutes',
              )}`
        }\n`;
      if (hotelTimeInMilis > 0)
        txt += `\`${ctx.locale('commands:cooldowns.hotel')}\` | ${
          hotelTimeInMilis > 3600000
            ? `**${moment.utc(hotelTimeInMilis).format('HH:mm:ss')}** ${ctx.locale(
                'commands:cooldowns.hours',
              )}`
            : `**${moment.utc(hotelTimeInMilis).format('mm:ss')}** ${ctx.locale(
                'commands:cooldowns.minutes',
              )}`
        }\n`;

      if (deathTimeInMilis <= 0 && hotelTimeInMilis <= 0) {
        dungeonCooldownInMilis < 0
          ? (txt += `\`${ctx.locale('commands:cooldowns.dungeon')}\` | ${ctx.locale(
              'commands:cooldowns.no-cooldown',
            )}\n`)
          : (txt += `\`${ctx.locale('commands:cooldowns.dungeon')}\` | **${moment
              .utc(dungeonCooldownInMilis)
              .format('mm:ss')}** ${ctx.locale('commands:cooldowns.minutes')}\n`);
      }

      jobCooldownInMilis < 0
        ? (txt += `\`${ctx.locale('commands:cooldowns.job')}\` | ${ctx.locale(
            'commands:cooldowns.no-cooldown',
          )}\n`)
        : (txt += `\`${ctx.locale('commands:cooldowns.job')}\` | ${
            jobCooldownInMilis > 3600000
              ? `**${moment.utc(jobCooldownInMilis).format('HH:mm:ss')}** ${ctx.locale(
                  'commands:cooldowns.hours',
                )}`
              : `**${moment.utc(jobCooldownInMilis).format('mm:ss')}** ${ctx.locale(
                  'commands:cooldowns.minutes',
                )}`
          }\n`);
    }
    voteCooldownInMilis && voteCooldownInMilis < 0
      ? (txt += `\`${ctx.locale('commands:cooldowns.vote')}\` | ${ctx.locale(
          'commands:cooldowns.no-cooldown',
        )}`)
      : (txt += `\`${ctx.locale('commands:cooldowns.vote')}\` | ${
          voteCooldownInMilis > 3600000
            ? `**${moment.utc(voteCooldownInMilis).format('HH:mm:ss')}** ${ctx.locale(
                'commands:cooldowns.hours',
              )}`
            : `**${moment.utc(voteCooldownInMilis).format('mm:ss')}** ${ctx.locale(
                'commands:cooldowns.minutes',
              )}`
        }`);

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:cooldowns.title'))
      .setColor('#6597df')
      .setDescription(txt);

    ctx.sendC(ctx.message.author.toString(), embed);
  }
}
