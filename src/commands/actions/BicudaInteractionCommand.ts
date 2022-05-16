import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class BicudaInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'bicuda',
      nameLocalizations: { 'en-US': 'kick' },
      description: '「🦶」・Da uma bicudassa em alguém',
      descriptionLocalizations: { 'en-US': '「🦶」・Give someone a kick' },
      options: [
        {
          name: 'user',
          type: 'USER',
          descriptionLocalizations: { 'en-US': 'User to kick' },
          description: 'Usuário para chutar',
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

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

    const selectedImage = await HttpRequests.getAssetImageUrl('bicuda');
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

    await ctx.makeMessage({ embeds: [embed] });
  }
}
