import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class PatInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'carinho',
      nameLocalizations: { 'en-US': 'cuddle' },
      description: '「😊」・Oti meudeus, faz carinho em alguém',
      descriptionLocalizations: { 'en-US': '「😊」・Cuddle someone' },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer fazer carinho',
          descriptionLocalizations: { 'en-US': 'User you want to cuddle' },
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:carinho.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('pat');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:carinho.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:carinho.embed_description', {
          autor: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
