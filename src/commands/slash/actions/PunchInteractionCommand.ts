import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, User } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class CryInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'socar',
      description: '「👊」・Da um socão em alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer socar',
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const rand = await HttpRequests.getAssetImageUrl('punch');
    const user = ctx.args[0].user as User;

    if (user.bot) {
      await ctx.replyT('error', 'commands:punch.bot');
      return;
    }

    if (user.id === ctx.interaction.user.id) {
      await ctx.replyT('error', 'commands:punch.self-mention', {}, true);
      return;
    }

    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:punch.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:punch.embed_description', {
          author: ctx.interaction.user.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);
    await ctx.reply({ embeds: [embed] });
  }
}
