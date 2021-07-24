import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../structures/Command';

export default class SuggestCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'suggest',
      aliases: ['sugerir', 'sugestão'],
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx: CommandContext) {
    const argumentos = ctx.args.join(' ');
    const cor = `#${`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`.slice(-6)}`;

    if (!argumentos) return ctx.replyT('error', 'commands:suggest.no-args');

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
      process.env.SUGGEST_HOOK_ID,
      process.env.SUGGEST_HOOK_TOKEN,
    );

    await webhook.send(embed);

    if (ctx.message.deletable) ctx.message.delete();
    ctx.replyT('heart', 'commands:suggest.thanks');
  }
}
