import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class CryCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cry',
      nameLocalizations: { 'pt-BR': 'chorar' },
      description: "「😭」・Show everyone that you're crying :((",
      descriptionLocalizations: { 'pt-BR': '「😭」・Mostre para os que você está chorando :((' },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'User that made you cry',
          descriptionLocalizations: { 'pt-BR': 'Usuário que te fez chorar' },
          required: false,
        },
        {
          name: 'reason',
          nameLocalizations: { 'pt-BR': 'motivo' },
          type: 'STRING',
          description: 'Why are you crying?',
          descriptionLocalizations: { 'pt-BR': 'Por que você está chorando?' },
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user');
    const reason = ctx.options.getString('reason');

    if (user?.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:chorar.bot'),
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('cry');

    if (!user || user.id === ctx.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:chorar.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:chorar.no-mention.embed_description', {
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
      .setTitle(ctx.locale('commands:chorar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:chorar.embed_description', {
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
