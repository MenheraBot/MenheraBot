import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class AngryCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'raiva',
      description: '「😡」・Mostre a todos que está com raiva',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que te deixou com raiva',
          required: false,
        },
        {
          name: 'motivo',
          type: 'STRING',
          description: 'Por que você está com raiva?',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', false);
    const reason = ctx.options.getString('motivo', false);

    if (user?.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:raiva.bot'),
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('angry');

    if (!user || user.id === ctx.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:raiva.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:raiva.no-mention.embed_description', {
            author: ctx.author.toString(),
          }),
        )
        .setThumbnail(avatar)
        .setImage(selectedImage);

      if (reason)
        embed.setDescription(
          `${embed.description}\n\n_"${capitalize(
            reason,
          )}"_ - ${ctx.author.username.toUpperCase()}, ${TODAYS_YEAR}`,
        );

      await ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:raiva.no-mention.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:raiva.embed_description', {
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
