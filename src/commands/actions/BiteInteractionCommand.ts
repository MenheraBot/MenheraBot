import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class BiteInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'morder',
      nameLocalizations: { 'en-US': 'bite' },
      description: '「👄」・Nhac. Moide alguém >.<',
      descriptionLocalizations: { 'en-US': '「👄」・Nhac. Bite someone >.<' },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para morder :3',
          descriptionLocalizations: { 'en-US': 'User to bite :3' },
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
        content: ctx.prettyResponse('warn', 'commands:morder.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:morder.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('bite');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:morder.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:morder.embed_description', {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
