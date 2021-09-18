import MenheraClient from 'src/MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class ResurrectInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ressuscitar',
      description: '「✝️」・Usa uma ult da sage em alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer ressuscitar',
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const rand = await HttpRequests.getAssetImageUrl('resurrect');
    const user = ctx.options.getUser('user', true);
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user.id === ctx.author.id) {
      await ctx.replyT('question', 'self-mention', {}, true);
      return;
    }

    if (user.bot) {
      await ctx.replyT('success', 'bot');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate('embed_description', {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
