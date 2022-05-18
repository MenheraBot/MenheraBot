import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class KissCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'kiss',
      nameLocalizations: {
        'pt-BR': 'beijar',
      },
      description: '「😘」・Give a kiss to someone you like',
      descriptionLocalizations: { 'pt-BR': '「😘」・De uma beijoquita em alguém que tu goste' },
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          description: 'User that you wanna kiss',
          descriptionLocalizations: { 'pt-BR': 'Usuário que você quer beijar' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'place',
          nameLocalizations: { 'pt-BR': 'local' },
          description: 'Place you want to kiss',
          descriptionLocalizations: { 'pt-BR': 'Lugar que você quer dar o beijo' },
          required: true,
          choices: [
            { name: '👄 | Mouth', value: '0', nameLocalizations: { 'pt-BR': '👄 | Boca' } },
            { name: '🌸 | Cheek', value: '1', nameLocalizations: { 'pt-BR': '🌸 | Bochecha' } },
          ],
        },
        {
          type: 'STRING',
          name: 'reason',
          nameLocalizations: { 'pt-BR': 'motivo' },
          description: 'Why do you wanna kiss?',
          descriptionLocalizations: { 'pt-BR': 'Por que voce quer beijar?' },
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('reason');

    if (user.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:beijar.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:beijar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage =
      ctx.options.getString('place', true) === '0'
        ? await HttpRequests.getAssetImageUrl('kiss')
        : await HttpRequests.getAssetImageUrl('cheek');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:beijar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale(`commands:beijar.embed_description_${ctx.options.getString('local') as '1'}`, {
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
