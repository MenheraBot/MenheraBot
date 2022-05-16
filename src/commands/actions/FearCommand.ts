import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class FearCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'medo',
      nameLocalizations: { 'en-US': 'fear' },
      description: '「😮」・Mostre para todos que tu ta com medo',
      descriptionLocalizations: { 'en-US': "「😮」・Show everyone you're scared" },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que te deixou com medo',
          descriptionLocalizations: { 'en-US': 'User who scared you' },
          required: false,
        },
        {
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          type: 'STRING',
          description: 'Por que tu ta com medo?',
          descriptionLocalizations: { 'en-US': 'Why are you afraid?' },
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const selectedImage = await HttpRequests.getAssetImageUrl('fear');
    const user = ctx.options.getUser('user');
    const reason = ctx.options.getString('motivo');

    if (!user || user.id === ctx.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:medo.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:medo.no-mention.embed_description', {
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
      .setTitle(ctx.locale('commands:medo.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:medo.embed_description', {
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
