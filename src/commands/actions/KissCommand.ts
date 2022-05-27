import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import { getAssetLink } from '@structures/CdnManager';
import { capitalize } from '@utils/Util';

export default class KissCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'beijar',
      nameLocalizations: {
        'en-US': 'kiss',
      },
      description: '「😘」・De uma beijoquita em alguém que tu goste',
      descriptionLocalizations: { 'en-US': '「😘」・Give a kiss to someone you like' },
      category: 'actions',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que você quer beijar',
          descriptionLocalizations: { 'en-US': 'User that you wanna kiss' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'local',
          nameLocalizations: { 'en-US': 'place' },
          description: 'Lugar que você quer dar o beijo',
          descriptionLocalizations: { 'en-US': 'Place you want to kiss' },
          required: true,
          choices: [
            { name: '👄 | Boca', value: '0', nameLocalizations: { 'en-US': '👄 | Mouth' } },
            { name: '🌸 | Bochecha', value: '1', nameLocalizations: { 'en-US': '🌸 | Cheek' } },
          ],
        },
        {
          type: 'STRING',
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Por que voce quer beijar?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna kiss?' },
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const reason = ctx.options.getString('motivo');

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
      ctx.options.getString('local', true) === '0' ? getAssetLink('kiss') : getAssetLink('cheek');
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
