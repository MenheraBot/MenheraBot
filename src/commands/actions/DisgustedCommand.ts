import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class DisgustedCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'nojo',
      description: '「🤮」・Ai que nojo cara, o que aconteceu',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que tu ta com nojo',
          required: false,
        },
        {
          name: 'motivo',
          type: 'STRING',
          description: 'Por que tu ta com nojo?',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user');
    const reason = ctx.options.getString('motivo');

    if (user?.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:nojo.bot'),
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('disgusted');

    if (!user || user.id === ctx.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:nojo.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:nojo.no-mention.embed_description', {
            author: ctx.author.toString(),
          }),
        )
        .setThumbnail(avatar)
        .setImage(selectedImage);

      if (reason)
        embed.setDescription(
          `${embed.description}\n\n_"${capitalize(
            reason,
          )}"_ - ${ctx.author.username.toUpperCase()}, ${new Date().getFullYear()}`,
        );

      await ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:nojo.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:nojo.embed_description', {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    if (reason)
      embed.setDescription(
        `${embed.description}\n\n_"${capitalize(
          reason,
        )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`,
      );

    await ctx.makeMessage({ embeds: [embed] });
  }
}
