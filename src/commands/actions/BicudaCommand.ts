import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import { capitalize } from '@utils/Util';
import { getAssetLink } from '@structures/CdnManager';

export default class BicudaCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'bicuda',
      description: '「🦵」・Da uma bicudassa em alguém',
      nameLocalizations: { 'en-US': 'kick' },
      descriptionLocalizations: { 'en-US': '「🦶」・Give someone a kick' },
      options: [
        {
          name: 'user',
          type: 'USER',
          descriptionLocalizations: { 'en-US': 'User to kick' },
          description: 'Usuário para dar a bicuda',
          required: true,
        },
        {
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          type: 'STRING',
          description: 'Por que você quer chutar?',
          descriptionLocalizations: { 'en-US': 'Why are you angry?' },
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
        content: ctx.prettyResponse('warn', 'commands:bicuda.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:bicuda.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = getAssetLink('bicuda');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bicuda.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:bicuda.embed_description', {
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
