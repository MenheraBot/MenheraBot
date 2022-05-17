import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class MamarCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'lick',
      nameLocalizations: { 'pt-BR': 'mamar' },
      description: '「😝」・Lick someone',
      descriptionLocalizations: { 'pt-BR': '「😝」・De uma mamada de Qualidade monstra em alguém' },
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          description: 'User you want to lick',
          descriptionLocalizations: { 'pt-BR': 'Usuário que você quer mamar' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'reason',
          nameLocalizations: { 'pt-BR': 'motivo' },
          description: 'Why do you wanna lick?',
          descriptionLocalizations: { 'pt-BR': 'Por que tu quer mamar?' },
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mention = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('reason');

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

    const selectedImage = await HttpRequests.getAssetImageUrl('mamar');
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
