import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
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
    const rand = await HttpRequests.getAssetImageUrl('bite');
    const user = ctx.options.getUser('user', true);

    if (user.bot) {
      await ctx.replyT('warn', 'commands:bite.bot');
      return;
    }

    if (user.id === ctx.interaction.user.id) {
      await ctx.replyT('error', 'commands:bite.self-mention', {}, true);
      return;
    }

    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bite.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:bite.embed_description', {
          author: ctx.interaction.user.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
