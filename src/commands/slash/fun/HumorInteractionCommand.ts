import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
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
    const rand = await HttpRequests.getAssetImageUrl('humor');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setTitle(`${ctx.interaction.user.username} ${ctx.locale('commands:humor.phrase')}`);

    await ctx.reply({ embeds: [embed] });
  }
}
