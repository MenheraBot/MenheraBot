import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class KillCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'kill',
      nameLocalizations: { 'pt-BR': 'matar' },
      description: "「☠️」・Kill that person you can't take anymore (just kidding)",
      descriptionLocalizations: {
        'pt-BR': '「☠️」・Mate aquela pessoa que tu não aguenta mais (de mentirinha hihi)',
      },
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          description: 'User that you wanna kill',
          descriptionLocalizations: { 'pt-BR': 'Usuário que você quer matar' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'reason',
          nameLocalizations: { 'pt-BR': 'motivo' },
          description: 'Why do you wanna do that?',
          descriptionLocalizations: { 'pt-BR': 'Por que tu quer fazer isso?' },
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('reason');

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
