import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import { capitalize } from '@utils/Util';
import { getAssetLink } from '@structures/CdnManager';

export default class BiteCommand extends InteractionCommand {
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
          descriptionLocalizations: { 'en-US': 'User to bite :3' },
          description: 'Usuário para morder :3',
          required: true,
        },
        {
          type: 'STRING',
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que tu quer morder?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna bite?' },
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
    const selectedImage = getAssetLink('bite');

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

    if (reason)
      embed.setDescription(
        `${embed.description}\n\n_"${capitalize(
          reason,
        )}"_ - ${ctx.author.username.toUpperCase()}, ${new Date().getFullYear()}`,
      );

    await ctx.makeMessage({ embeds: [embed] });
  }
}