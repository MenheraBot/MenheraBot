import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class PunchCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'socar',
      description: '「👊」・Da um socão em alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer socar',
          required: true,
        },
        {
          name: 'motivo',
          type: 'STRING',
          description: 'Por que tu quer socar man?',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('motivo');

    if (user.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:socar.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:socar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('punch');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:socar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:socar.embed_description', {
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
