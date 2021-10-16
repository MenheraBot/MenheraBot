import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class KillInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'matar',
      description: '「☠️」・Mate aquela pessoa que tu não aguenta mais (de mentirinha hihi)',
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que você quer matar',
          required: true,
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    if (user.id === ctx.author.id) {
      await ctx.replyT('error', 'self-mention', {}, true);
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user.bot) {
      const robotsLink = [
        'https://i.imgur.com/tv9wQai.gif',
        'https://i.imgur.com/X9uUyEB.gif',
        'https://i.imgur.com/rtsjxWQ.gif',
      ];

      const selectedImage = robotsLink[Math.floor(Math.random() * robotsLink.length)];

      const embed = new MessageEmbed()
        .setTitle(ctx.translate('bot.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.translate('bot.embed_description', {
            author: ctx.author.toString(),
            mention: user.toString(),
          }),
        )
        .setImage(selectedImage)
        .setThumbnail(avatar);

      await ctx.reply({ embeds: [embed] });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('kill');
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
