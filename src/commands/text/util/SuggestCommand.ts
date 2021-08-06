import CommandContext from '@structures/command/CommandContext';
import { ColorResolvable, MessageButton, MessageEmbed } from 'discord.js';
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
    const cor = `#${`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`.slice(-6)}`;

    if (!argumentos) {
      await ctx.replyT('error', 'commands:suggest.no-args');
      return;
    }

    const embed = new MessageEmbed()
      .setDescription(`**${argumentos}**`)
      .setColor(cor as ColorResolvable)
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

    const firstButton = new MessageButton()
      .setLabel('Aceitar')
      .setStyle('SUCCESS')
      .setCustomId('OK');

    const secondButton = new MessageButton().setLabel('Negar').setStyle('DANGER').setCustomId('NO');

    const thirdButton = new MessageButton()
      .setLabel('Fila')
      .setCustomId('FILA')
      .setEmoji('🟡')
      .setStyle('PRIMARY');

    await webhook.send({
      embeds: [embed],
      components: [{ type: 1, components: [firstButton, secondButton, thirdButton] }],
    });

    if (ctx.message.deletable) await ctx.message.delete();
    await ctx.replyT('heart', 'commands:suggest.thanks');
  }
}
