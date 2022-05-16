import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class SniffCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cheirar',
      nameLocalizations: { 'en-US': 'sniff' },
      description: '「👃」・Da uma cheiradinha em alguém hgmmm',
      descriptionLocalizations: { 'en-US': '「👃」・Give someone a sniff hgmmm' },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário pra mete a narigada sugadora ultradimensional',
          descriptionLocalizations: { 'en-US': 'User to make the ultradimensional sniffer' },
          required: false,
        },
        {
          name: 'motivo',
          type: 'STRING',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que tu quer dar a talda cheirada?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna sniff? (strange question)' },
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
        content: ctx.prettyResponse('error', 'commands:cheirar.bot'),
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('sniff');

    if (!user || user.id === ctx.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:cheirar.no-mention.embed_title'))
        .setColor(COLORS.ACTIONS)
        .setDescription(
          ctx.locale('commands:cheirar.no-mention.embed_description', {
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
      .setTitle('Sniff Sniff')
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:cheirar.embed_description', {
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
