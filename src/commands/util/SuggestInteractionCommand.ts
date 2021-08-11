import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';

export default class SuggestInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'sugerir',
      description: '「🥺」・Tem uma ideia de gangster? Envie utilizando esse comando',
      options: [
        {
          type: 'STRING',
          name: 'sugestao',
          description: 'Sugestão para enviar',
          required: true,
        },
      ],
      category: 'util',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const argumentos = ctx.options.getString('sugestao', true);

    const cor = `#${`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`.slice(
      -6,
    )}` as const;

    if (argumentos.length < 10) {
      await ctx.replyT('error', 'commands:suggest.no-args', {}, true);
      return;
    }

    const embed = new MessageEmbed()
      .setDescription(`**${argumentos}**`)
      .setColor(cor)
      .setThumbnail(ctx.interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter(`ID do usuário: ${ctx.interaction.user.id} | ${ctx.interaction.id}`)
      .setTimestamp()
      .setAuthor(
        `Sugestão de ${ctx.interaction.user.tag}`,
        ctx.interaction.user.displayAvatarURL({ dynamic: true }),
      );

    const webhook = await this.client.fetchWebhook(
      process.env.SUGGEST_HOOK_ID as string,
      process.env.SUGGEST_HOOK_TOKEN as string,
    );

    await webhook.send({ embeds: [embed] });

    await ctx.replyT('heart', 'commands:suggest.thanks');
  }
}
