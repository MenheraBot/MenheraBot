import CommandContext from '@structures/command/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../../structures/command/Command';

export default class SuggestCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'suggest',
      aliases: ['sugerir', 'sugestão'],
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const argumentos = ctx.args.join(' ');
    const cor = `#${`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`.slice(
      -6,
    )}` as const;

    if (!argumentos) {
      await ctx.replyT('error', 'commands:suggest.no-args');
      return;
    }

    const embed = new MessageEmbed()
      .setDescription(`**${argumentos}**`)
      .setColor(cor)
      .setThumbnail(ctx.message.author.displayAvatarURL({ dynamic: true }))
      .setFooter(`ID do usuário: ${ctx.message.author.id} | ${ctx.message.id}`)
      .setTimestamp()
      .setAuthor(
        `Sugestão de ${ctx.message.author.tag}`,
        ctx.message.author.displayAvatarURL({ dynamic: true }),
      );

    const webhook = await this.client.fetchWebhook(
      process.env.SUGGEST_HOOK_ID as string,
      process.env.SUGGEST_HOOK_TOKEN as string,
    );

    await webhook.send({ embeds: [embed] });

    if (ctx.message.deletable) await ctx.message.delete();
    await ctx.replyT('heart', 'commands:suggest.thanks');
  }
}
