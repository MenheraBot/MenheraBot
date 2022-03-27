import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class ShotInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'atirar',
      description: '「🔫」・Pow! Dê um tiro em alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer dar o tiro',
          required: true,
        },
        {
          name: 'motivo',
          type: 'STRING',
          description: 'Por que tu quer fazer isso?',
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

    if (reason) embed.setDescription(`${embed.description}\n\n_"${reason}"_`);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
