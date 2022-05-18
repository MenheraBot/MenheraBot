import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class ShotCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'shot',
      nameLocalizations: { 'pt-BR': 'atirar' },
      description: '「🔫」・Pow! shoot someone',
      descriptionLocalizations: { 'pt-BR': '「🔫」・Pow! Dê um tiro em alguém' },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'User you want to shoot',
          descriptionLocalizations: { 'pt-BR': 'Usuário que você quer dar o tiro' },
          required: true,
        },
        {
          name: 'reason',
          type: 'STRING',
          nameLocalizations: { 'pt-BR': 'motivo' },
          description: 'Why do you wanna do that?',
          descriptionLocalizations: { 'pt-BR': 'Por que tu quer fazer isso?' },
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('reason');

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
