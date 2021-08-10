import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class ThinkInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'pensar',
      description: '「🤔」・Ser ou não ser? Eis a questão. Pense, pense sobre alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário em que você está pensando',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const rand = await HttpRequests.getAssetImageUrl('think');
    const user = ctx.args[0]?.user;
    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user || user.id === ctx.interaction.user.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:think.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:think.no-mention.embed_description', {
            author: ctx.interaction.user.toString(),
          }),
        )
        .setThumbnail(avatar)
        .setImage(rand);

      await ctx.reply({ embeds: [embed] });
      return;
    }

    if (user.bot) {
      await ctx.replyT('success', 'commands:think.bot');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:think.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:think.embed_description', {
          author: ctx.interaction.user.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
