import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class SniffInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cheirar',
      description: '「👃」・Da uma cheiradinha em alguém hgmmm',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário pra mete a narigada sugadora ultradimensional',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user');

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

    await ctx.makeMessage({ embeds: [embed] });
  }
}
