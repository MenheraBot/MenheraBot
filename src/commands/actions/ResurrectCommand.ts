import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class ResurrectCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'resurrect',
      nameLocalizations: { 'pt-BR': 'ressuscitar' },
      description: '「✝️」・Use a sage ult on someone',
      descriptionLocalizations: { 'pt-BR': '「✝️」・Usa uma ult da sage em alguém' },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'User you want to resurrect',
          descriptionLocalizations: { 'pt-BR': 'Usuário que você quer ressuscitar' },
          required: true,
        },
        {
          name: 'reason',
          nameLocalizations: { 'pt-BR': 'motivo' },
          type: 'STRING',
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
        content: ctx.prettyResponse('question', 'commands:ressuscitar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (user.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:ressuscitar.bot'),
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = await HttpRequests.getAssetImageUrl('resurrect');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:ressuscitar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:ressuscitar.embed_description', {
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
