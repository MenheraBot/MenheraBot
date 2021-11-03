import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class FodaseInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'fodase',
      description: '「🖕」・Lançe um famoso "Foda-se" no chat',
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const frases =
      ctx.data.server.lang === 'pt-BR'
        ? [
            `${ctx.author.username} disse que fodase`,
            'Inteligente, pena que fodase',
            'Ta, e o fodase?',
          ]
        : [
            `${ctx.author.username} said it dont care`,
            'Nice, but fuck it',
            "Cool, but i don't care",
          ];

    const frasesUsada = frases[Math.floor(Math.random() * frases.length)];
    const selectedImage = await HttpRequests.getAssetImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(selectedImage)
      .setFooter(ctx.locale('commands:fodase.author', { author: ctx.author.username }))
      .setTitle(frasesUsada);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
