import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class ThinkCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'pensar',
      nameLocalizations: { 'en-US': 'think' },
      description: '「🤔」・Ser ou não ser? Eis a questão. Pense, pense sobre alguém',
      descriptionLocalizations: {
        'en-US': '「🤔」・To be or not to be? That is the question. Think, think about someone',
      },
      options: [
        {
          name: 'usuário',
          nameLocalizations: { 'en-US': 'user' },
          type: 'USER',
          description: 'Usuário em que você está pensando',
          descriptionLocalizations: { 'en-US': 'User you are thinking of' },
          required: false,
        },
        {
          name: 'motivo',
          type: 'STRING',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que tu ta pensando?',
          descriptionLocalizations: { 'en-US': 'Why are you thinking?' },
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
        content: ctx.prettyResponse('success', 'commands:pensar.bot'),
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('think');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    if (!user || user.id === ctx.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:pensar.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:pensar.no-mention.embed_description', {
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
      .setTitle(ctx.locale('commands:pensar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:pensar.embed_description', {
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
