import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class DisgustedInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'nojo',
      description: '「🤮」・Ai que nojo cara, o que aconteceu',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que tu ta com nojo',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const rand = await HttpRequests.getAssetImageUrl('disgusted');
    const user = ctx.args[0]?.user;
    const avatar = ctx.interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user || user.id === ctx.interaction.user.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:disgusted.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:disgusted.no-mention.embed_description', {
            author: ctx.interaction.user.toString(),
          }),
        )
        .setThumbnail(avatar)
        .setImage(rand);
      await ctx.reply({ embeds: [embed] });
      return;
    }

    if (user.bot) {
      await ctx.replyT('error', 'commands:disgusted.bot');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle('Nojo')
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:disgusted.embed_description', {
          author: ctx.interaction.user.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(rand)
      .setThumbnail(avatar);

    await ctx.reply({ embeds: [embed] });
  }
}
