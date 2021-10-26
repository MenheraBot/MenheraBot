import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class BiteInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'morder',
      description: '「👄」・Nhac. Moide alguém >.<',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para morder :3',
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    if (user.bot) {
      await ctx.replyL('warn', 'commands:morder.bot');
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.replyL('error', 'commands:morder.self-mention', {}, true);
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('bite');

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate('embed_description', {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
