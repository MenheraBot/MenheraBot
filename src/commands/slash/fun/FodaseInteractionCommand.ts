import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class HuntInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'fodase',
      description: '「🖕」・Lançe um famoso "Foda-se" no chat',
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const frases =
      ctx.data.server.lang === 'pt-BR'
        ? [
            `${ctx.interaction.user.username} disse que fodase`,
            'Inteligente, pena que fodase',
            'Ta, e o fodase?',
          ]
        : [
            `${ctx.interaction.user.username} said it dont care`,
            'Nice, but fuck it',
            "Cool, but i don't care",
          ];

    const frasesUsada = frases[Math.floor(Math.random() * frases.length)];
    const rand = await HttpRequests.getAssetImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setFooter(`Autor: ${ctx.interaction.user.username}`)
      .setTitle(frasesUsada);

    await ctx.reply({ embeds: [embed] });
  }
}
