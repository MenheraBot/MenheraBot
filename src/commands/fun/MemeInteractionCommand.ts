import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import { MessageEmbed } from 'discord.js-light';

export default class MemeInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'meme',
      description: '「🤣」・Atumalaca KKKK. Apenas os melhores memes',
      options: [
        {
          name: 'fodase',
          description: '「🖕」・Lançe um famoso "Foda-se" no chat',
          type: 'SUB_COMMAND',
        },
        {
          name: 'humor',
          description: '「🤣」・KK tumor e piadas',
          type: 'SUB_COMMAND',
        },
      ],
      category: 'fun',
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);

    if (command === 'fodase') MemeInteractionCommand.FodaseInteractionCommand(ctx);

    if (command === 'humor') MemeInteractionCommand.HumorInteractionCommand(ctx);
  }

  static async HumorInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const selectedImage = await HttpRequests.getAssetImageUrl('humor');

    const embed = new MessageEmbed().setImage(selectedImage).setColor('RANDOM');

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async FodaseInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
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
