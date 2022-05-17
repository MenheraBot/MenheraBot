import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class GrumbleCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'grumble',
      nameLocalizations: { 'pt-BR': 'resmungar' },
      description: "「😖」・Show everyone you're mumbling. humpf",
      descriptionLocalizations: {
        'pt-BR': '「😖」・Mostre para todos que tu ta resmungando. Humpf',
      },
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const selectedImage = await HttpRequests.getAssetImageUrl('grumble');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:resmungar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:resmungar.embed_description', {
          author: ctx.author.toString(),
        }),
      )
      .setThumbnail(avatar)
      .setImage(selectedImage);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
