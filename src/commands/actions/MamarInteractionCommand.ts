import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class MamarInteractionCommand extends InteractionCommand {
  constructor() {
    super({
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
        content: ctx.prettyResponse('error', 'commands:mamar.bot', {
          author: ctx.author.toString(),
          mention: mention.toString(),
        }),
      });
      return;
    }

    if (mention.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:mamar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (await ctx.client.repositories.blacklistRepository.isUserBanned(mention.id)) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:mamar.user-banned'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('mamar');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:mamar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:mamar.embed_description', {
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
