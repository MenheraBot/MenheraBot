import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class HumorInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'humor',
      description: '「🤣」・KK tumor e piadas',
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selectedImage = await HttpRequests.getAssetImageUrl('humor');

    const embed = new MessageEmbed().setImage(selectedImage).setColor('RANDOM');

    await ctx.makeMessage({ embeds: [embed] });
  }
}
