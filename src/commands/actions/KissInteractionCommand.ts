import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class KissInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'beijar',
      description: '「😘」・De uma beijoquita em alguém que tu goste',
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que você quer beijar',
          required: true,
        },
        {
          type: 'STRING',
          name: 'local',
          description: 'Lugar que você quer dar o beijo',
          required: true,
          choices: [
            { name: '👄 | Boca', value: '0' },
            { name: '🌸 | Bochecha', value: '1' },
          ],
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    if (user.bot) {
      await ctx.replyT('error', 'bot');
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.replyT('error', 'self-mention', {}, true);
      return;
    }

    const selectedImage =
      ctx.options.getString('local', true) === '0'
        ? await HttpRequests.getAssetImageUrl('kiss')
        : await HttpRequests.getAssetImageUrl('cheek');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate(`embed_description_${ctx.options.getString('local')}`, {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
