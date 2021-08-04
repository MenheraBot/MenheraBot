import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

export default class ReportCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'report',
      aliases: ['reportar', 'bug'],
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const argumentos = ctx.args.join(' ');
    const cor = `#${`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`.slice(-6)}`;

    if (!argumentos) {
      await ctx.replyT('error', 'commands:report.no-args');
      return;
    }

    const embed = new MessageEmbed()
      .setDescription(`${argumentos}`)
      .setColor(cor)
      .setThumbnail(ctx.message.author.displayAvatarURL({ dynamic: true }))
      .setFooter(`ID do usuário: ${ctx.message.author.id}`)
      .setTimestamp()
      .setAuthor(
        `Novo Bug Reportado por ${ctx.message.author.tag}`,
        ctx.message.author.displayAvatarURL({ dynamic: true }),
      );

    const reportWebhook = await this.client.fetchWebhook(
      process.env.BUG_HOOK_ID as string,
      process.env.BUG_HOOK_TOKEN as string,
    );

    await reportWebhook.send(embed);

    if (ctx.message.deletable) await ctx.message.delete();
    await ctx.replyT('success', 'commands:report.thanks');
  }
}
