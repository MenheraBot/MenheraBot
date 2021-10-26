import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class MamarInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'mamar',
      description:
        '「🧉」・Principal comando da Menhera. De uma mamada de Qualidade monstra em alguém',
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que você quer mamar',
          required: true,
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mention = ctx.options.getUser('user', true);

    if (mention.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'bot', {
          author: ctx.author.toString(),
          mention: mention.toString(),
        }),
      });
      return;
    }

    if (mention.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('mamar');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate('embed_description', {
          author: ctx.author.toString(),
          mention: mention.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    await ctx.makeMessage({ embeds: [embed] });
    await ctx.client.repositories.mamarRepository.mamar(ctx.author.id, mention.id);
  }
}
