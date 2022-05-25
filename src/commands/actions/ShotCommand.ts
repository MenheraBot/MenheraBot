import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class ShotCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'atirar',
      nameLocalizations: { 'en-US': 'shot' },
      description: '「🔫」・Pow! Dê um tiro em alguém',
      descriptionLocalizations: { 'en-US': '「🔫」・Pow! shoot someone' },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer dar o tiro',
          descriptionLocalizations: { 'en-US': 'User you want to shoot' },
          required: true,
        },
        {
          name: 'motivo',
          type: 'STRING',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que tu quer fazer isso?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna do that?' },
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

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:atirar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('shot');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:atirar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:atirar.embed_description', {
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
