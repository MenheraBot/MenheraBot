import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';
import { MessageEmbed } from 'discord.js-light';

export default class MemeCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'meme',
      description: '「🤣」・Atumalaca LOL. Only the best memes',
      descriptionLocalizations: { 'pt-BR': '「🤣」・Atumalaca KKKK. Apenas os melhores memes' },
      options: [
        {
          name: 'idc',
          nameLocalizations: { 'pt-BR': 'fds' },
          description: "「🤫」・Show that you don't care in a brazilian way",
          descriptionLocalizations: { 'pt-BR': '「🤫」・Lançe o Bruno Henrique no chat' },
          type: 'SUB_COMMAND',
        },
        {
          name: 'humor',
          description: '「🤣」・LOL Humor and Jokes',
          descriptionLocalizations: { 'pt-BR': '「🤣」・KK Tumor e Piadas' },
          type: 'SUB_COMMAND',
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);

    if (command === 'idc') MemeCommand.FodaseInteractionCommand(ctx);

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
