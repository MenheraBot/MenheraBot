/* eslint-disable camelcase */
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import Command from '@structures/Command';
import { jobs as jobsFile, items as itemsFile } from '@structures/RpgHandler';
import rpgUtil from '@utils/RPGUtil';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { finalChecks } from '@structures/Rpgs/checks';

export default class WorkCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'work',
      aliases: ['trabalhar'],
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user)
      return ctx.replyT('error', 'commands:work.not-register', { prefix: ctx.data.server.prefix });

    const jobId = user.jobId || 0;
    if (jobId < 1)
      return ctx.replyT('error', 'commands:work.not-work', { prefix: ctx.data.server.prefix });

    if (parseInt(user.jobCooldown) > Date.now())
      return parseInt(user.jobCooldown) - Date.now() > 3600000
        ? ctx.replyT('error', 'commands:work.cooldown-hour', {
            time: moment.utc(parseInt(user.jobCooldown) - Date.now()).format('HH:mm:ss'),
          })
        : ctx.replyT('error', 'commands:work.cooldown-minute', {
            time: moment.utc(parseInt(user.jobCooldown) - Date.now()).format('mm:ss'),
          });

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:work.embed-title'))
      .setColor('#a6ff25')
      .setThumbnail(avatar);

    const { name, xp, work_cooldown_in_hours, min_money, max_money } = jobsFile[jobId];

    const items = itemsFile.jobs[jobId];

    const selectedItem = items[Math.floor(Math.random() * items.length)];

    const backpack = rpgUtil.getBackpack(user);
    const canGet = backpack.value < backpack.capacity;

    const totalMoney = Math.floor(Math.random() * (max_money - min_money) + max_money);
    const totalCooldown = 1000 * 60 * 60 * work_cooldown_in_hours;
    const traslatedJobName = ctx.locale(`roleplay:job.${jobId}.${name}`);
    const translatedItemName = ctx.locale(`roleplay:job.${jobId}.${selectedItem.name}`);

    embed
      .setDescription(
        ctx.locale('commands:work.embed-description', {
          job: traslatedJobName,
          money: totalMoney,
          xp,
        }),
      )
      .addField(
        ctx.locale('commands:work.field-name'),
        canGet
          ? ctx.locale('commands:work.field-value', { item: translatedItemName })
          : ctx.locale('commands:work.field-value-full'),
      );

    if (canGet) user.loots.push(selectedItem);
    user.jobCooldown = `${Date.now() + totalCooldown}`;
    user.money += totalMoney;
    user.xp += xp;
    await user.save();

    await finalChecks(ctx, user);

    ctx.sendC(ctx.message.author.toString(), embed);
  }
}
