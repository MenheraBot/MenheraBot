import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import { getAssetLink } from '@structures/CdnManager';
import { capitalize } from '@utils/Util';

export default class MamarCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'mamar',
      nameLocalizations: { 'en-US': 'lick' },
      description: '「😝」・De uma mamada de Qualidade monstra em alguém',
      descriptionLocalizations: { 'en-US': '「😝」・Lick someone' },
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que você quer mamar',
          descriptionLocalizations: { 'en-US': 'User you want to lick' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que tu quer mamar?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna lick?' },
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mention = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('motivo');

    if (mention.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:mamar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (await ctx.client.repositories.blacklistRepository.isUserBanned(mention.id)) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:mamar.user-banned'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = getAssetLink('mamar');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:mamar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:mamar.embed_description', {
          author: ctx.author.toString(),
          mention: mention.toString(),
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
    await ctx.client.repositories.mamarRepository.mamar(ctx.author.id, mention.id);
  }
}
