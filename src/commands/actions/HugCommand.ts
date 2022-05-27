import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import { getAssetLink } from '@structures/CdnManager';
import { capitalize } from '@utils/Util';

export default class HugCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'abraçar',
      nameLocalizations: { 'en-US': 'hug' },
      description: '「🤗」・Abraçe um amiguinho oti modeuso fofurica',
      descriptionLocalizations: {
        'en-US': '「🤗」・Hug a little friend nhaww mygodness what a cutie',
      },
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário que tu quer abraçar',
          descriptionLocalizations: { 'en-US': 'User that you want to hug' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          description: 'Tem um motivo em especial para abraçar?',
          descriptionLocalizations: { 'en-US': 'Is there any special reasons for this hug?' },
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
        content: ctx.prettyResponse('error', 'commands:abracar.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:abracar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });
    const selectedImage = getAssetLink('hug');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:abracar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:abracar.embed_description', {
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
