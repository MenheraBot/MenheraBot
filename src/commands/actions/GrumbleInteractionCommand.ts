import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class GrumbleInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'resmungar',
      description: '「😖」・Mostre para todos que tu ta resmungando. Humpf',
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const selectedImage = await HttpRequests.getAssetImageUrl('grumble');

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate('embed_description', {
          author: ctx.author.toString(),
        }),
      )
      .setThumbnail(avatar)
      .setImage(selectedImage);

    await ctx.reply({ embeds: [embed] });
  }
}
