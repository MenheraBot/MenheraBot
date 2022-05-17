import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import { MessageEmbed } from 'discord.js-light';

export default class MemeCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'meme',
      description: '「🤣」・Atumalaca KKKK. Apenas os melhores memes',
      descriptionLocalizations: { 'en-US': '「🤣」・Atumalaca LOL. Only the best memes' },
      options: [
        {
          name: 'fds',
          description: '「🤫」・Lançe o Bruno Henrique no chat',
          descriptionLocalizations: { 'en-US': "「🤫」・Show that you don't care" },
          type: 'SUB_COMMAND',
        },
        {
          name: 'humor',
          description: '「🤣」・KK Tumor e Piadas',
          descriptionLocalizations: { 'en-US': '「🤣」・LOL Humor and Jokes' },
          type: 'SUB_COMMAND',
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);

    if (command === 'fds') MemeCommand.FodaseInteractionCommand(ctx);

    if (command === 'humor') MemeCommand.HumorInteractionCommand(ctx);
  }

  static async HumorInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const selectedImage = await HttpRequests.getAssetImageUrl('humor');

    const embed = new MessageEmbed().setImage(selectedImage).setColor('RANDOM');

    await ctx.makeMessage({ embeds: [embed] });
  }

  static async FodaseInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const randomPhrase = `${Math.floor(Math.random() * 3)}`;

    const phrase = ctx.locale(`commands:fodase.${randomPhrase as '1'}`, {
      author: ctx.author.username,
    });

    const selectedImage = await HttpRequests.getAssetImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(selectedImage)
      .setFooter({ text: ctx.locale('commands:fodase.author', { author: ctx.author.username }) })
      .setTitle(phrase);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
