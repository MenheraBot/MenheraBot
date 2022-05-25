import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class KillCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'matar',
      nameLocalizations: { 'en-US': 'kill' },
      description: '「☠️」・Mate aquela pessoa que tu não aguenta mais (de mentirinha hihi)',
      descriptionLocalizations: {
        'en-US': "「☠️」・Kill that person you can't take anymore (just kidding)",
      },
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que você quer matar',
          descriptionLocalizations: { 'en-US': 'User that you wanna kill' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que tu quer fazer isso?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna do that?' },
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('motivo');

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:matar.self-mention'),
        ephemeral: true,
      });
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
        .setTitle(ctx.locale('commands:matar.bot.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:matar.bot.embed_description', {
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
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('kill');
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:matar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:matar.embed_description', {
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
