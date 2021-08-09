import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, User } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class CryInteractionCommand extends InteractionCommand {
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
    const user = ctx.args[0].user as User;
    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    if (user.id === ctx.interaction.user.id) {
      await ctx.replyT('question', 'commands:resurrect.self-mention', {}, true);
      return;
    }

    if (user.bot) {
      await ctx.replyT('success', 'commands:resurrect.bot');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:resurrect.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:resurrect.embed_description', {
          author: ctx.interaction.user.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
