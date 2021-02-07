/* eslint-disable camelcase */
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../structures/command');
const jobsFile = require('../../structures/Rpgs/jobs.json');
const itemsFile = require('../../structures/Rpgs/items.json');
const rpgUtil = require('../../utils/RPGUtil');

module.exports = class WorkCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'work',
      aliases: ['trabalhar'],
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, server }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:work.not-register', { prefix: server.prefix }));

    const jobId = user.jobId || 0;
    if (jobId < 1) return message.menheraReply('error', t('commands:work.not-work', { prefix: server.prefix }));

    if (parseInt(user.jobCooldown) > Date.now()) return parseInt(user.jobCooldown - Date.now()) > 3600000 ? message.menheraReply('error', t('commands:work.cooldown-hour', { time: moment.utc(parseInt(user.jobCooldown - Date.now())).format('HH:mm:ss') })) : message.menheraReply('error', t('commands:work.cooldown-minute', { time: moment.utc(parseInt(user.jobCooldown - Date.now())).format('mm:ss') }));

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:work.embed-title'))
      .setColor('#a6ff25')
      .setThumbnail(avatar);

    const {
      name, xp, work_cooldown_in_hours, min_money, max_money,
    } = jobsFile[jobId];

    const items = itemsFile.jobs[jobId];

    const selectedItem = items[Math.floor(Math.random() * items.length)];

    const backpack = rpgUtil.getBackpack(user);
    const canGet = backpack.value < backpack.capacity;

    const totalMoney = Math.floor(Math.random() * (max_money - min_money) + max_money);
    const totalCooldown = 1000 * 60 * 60 * work_cooldown_in_hours;
    const traslatedJobName = t(`roleplay:job.${jobId}.${name}`);
    const translatedItemName = t(`roleplay:job.${jobId}.${selectedItem.name}`);

    embed.setDescription(t('commands:work.embed-description', { job: traslatedJobName, money: totalMoney, xp }))
      .addField(t('commands:work.field-name'), canGet ? t('commands:work.field-value', { item: translatedItemName }) : t('commands:work.field-value-full'));

    if (canGet) user.loots.push(selectedItem);
    user.jobCooldown = Date.now() + totalCooldown;
    user.money += totalMoney;
    user.xp += xp;
    await user.save();

    await this.client.rpgChecks.finalChecks(message, user, t);

    message.channel.send(message.author, embed);
  }
};
