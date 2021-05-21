const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const jobsFile = require('../../structures/Rpgs/jobs.json');

module.exports = class JobCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'job',
      aliases: ['trabalho'],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run({ message, args, server }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:job.not-registred'));

    const array = Object.entries(jobsFile);

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setDescription(t('commands:job.text', { prefix: server.prefix }))
        .setColor('#9f4dd2')
        .setTitle(t('commands:job.embed-title'));

      for (let i = 1; i <= array.length; i++) {
        const job = jobsFile[i];
        embed.addField(`**[ ${i} ]** - ${t(`roleplay:job.${i}.${job.name}`)}`, `${t('commands:job.min-level')}: \`${job.min_level}\`\n${t('commands:job.money')}: \`${job.min_money} - ${job.max_money}\`\n${t('commands:job.xp')}: \`${job.xp}\`\n${t('commands:job.cooldown')}: \`${job.work_cooldown_in_hours}\` ${t('commands:job.hour')}`, true);
      }

      return message.channel.send(message.author, embed);
    }

    const escolha = args[0].replace(/\D+/g, '');
    if (!escolha || escolha.length === 0) return message.menheraReply('error', t('commands:job.invalid'));

    if (parseInt(escolha) < 1 || parseInt(escolha) > array.length || !jobsFile[escolha]) return message.menheraReply('error', t('commands:job.invalid'));

    const minLevel = jobsFile[escolha].min_level;
    if (minLevel > user.level) return message.menheraReply('error', t('commands:job.no-level', { level: minLevel }));

    user.jobId = parseInt(escolha);
    await user.save();

    message.menheraReply('success', t('commands:job.finish', { job: t(`roleplay:job.${escolha}.${jobsFile[escolha].name}`) }));
  }
};
