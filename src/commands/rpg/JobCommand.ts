import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import { jobs as jobsFile } from '@structures/RpgHandler';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { TJobIndexes } from '@utils/Types';

export default class JobCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'job',
      aliases: ['trabalho'],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
    if (!user) {
      await ctx.replyT('error', 'commands:job.not-registred');
      return;
    }

    const AllJobKeys = Object.keys(jobsFile);

    if (!ctx.args[0]) {
      const embed = new MessageEmbed()
        .setDescription(ctx.locale('commands:job.text', { prefix: ctx.data.server.prefix }))
        .setColor('#9f4dd2')
        .setTitle(ctx.locale('commands:job.embed-title'));

      for (let i = 1; i <= AllJobKeys.length; i++) {
        const job = jobsFile[i as TJobIndexes];
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

      await ctx.sendC(ctx.message.author.toString(), embed);
      return;
    }

    const escolha = ctx.args[0].replace(/\D+/g, '');
    if (!escolha || escolha.length === 0) {
      await ctx.replyT('error', 'commands:job.invalid');
      return;
    }

    const parsedChoice = parseInt(escolha);

    if (
      parsedChoice < 1 ||
      parsedChoice > AllJobKeys.length ||
      !jobsFile[parsedChoice as TJobIndexes]
    ) {
      await ctx.replyT('error', 'commands:job.invalid');
      return;
    }

    const minLevel = jobsFile[parsedChoice as TJobIndexes].min_level;
    if (minLevel > user.level) {
      await ctx.replyT('error', 'commands:job.no-level', { level: minLevel });
      return;
    }

    await this.client.repositories.rpgRepository.update(ctx.message.author.id, {
      jobId: parsedChoice as TJobIndexes,
    });

    await ctx.replyT('success', 'commands:job.finish', {
      job: ctx.locale(`roleplay:job.${escolha}.${jobsFile[parsedChoice as TJobIndexes].name}`),
    });
  }
}
