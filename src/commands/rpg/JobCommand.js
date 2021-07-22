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

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:job.not-registred');

    const array = Object.entries(jobsFile);

    if (!ctx.args[0]) {
      const embed = new MessageEmbed()
        .setDescription(ctx.locale('commands:job.text', { prefix: ctx.data.server.prefix }))
        .setColor('#9f4dd2')
        .setTitle(ctx.locale('commands:job.embed-title'));

      for (let i = 1; i <= array.length; i++) {
        const job = jobsFile[i];
        embed.addField(
          `**[ ${i} ]** - ${ctx.locale(`roleplay:job.${i}.${job.name}`)}`,
          `${ctx.locale('commands:job.min-level')}: \`${job.min_level}\`\n${ctx.locale(
            'commands:job.money',
          )}: \`${job.min_money} - ${job.max_money}\`\n${ctx.locale('commands:job.xp')}: \`${
            job.xp
          }\`\n${ctx.locale('commands:job.cooldown')}: \`${
            job.work_cooldown_in_hours
          }\` ${ctx.locale('commands:job.hour')}`,
          true,
        );
      }

      return ctx.sendC(ctx.message.author, embed);
    }

    const escolha = ctx.args[0].replace(/\D+/g, '');
    if (!escolha || escolha.length === 0) return ctx.replyT('error', 'commands:job.invalid');

    if (parseInt(escolha) < 1 || parseInt(escolha) > array.length || !jobsFile[escolha])
      return ctx.replyT('error', 'commands:job.invalid');

    const minLevel = jobsFile[escolha].min_level;
    if (minLevel > user.level)
      return ctx.replyT('error', 'commands:job.no-level', { level: minLevel });

    user.jobId = parseInt(escolha);
    await user.save();

    ctx.replyT('success', 'commands:job.finish', {
      job: ctx.locale(`roleplay:job.${escolha}.${jobsFile[escolha].name}`),
    });
  }
};
