import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class HugCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'hug',
      nameLocalizations: { 'pt-BR': 'abraçar' },
      description: '「🤗」・Hug a little friend nhaww mygodness what a cutie',
      descriptionLocalizations: {
        'pt-BR': '「🤗」・Abrace um amiguinho oti modeuso fofurica',
      },
      options: [
        {
          type: 'USER',
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          description: 'User that you want to hug',
          descriptionLocalizations: { 'pt-BR': 'Usuário que tu quer abraçar' },
          required: true,
        },
        {
          type: 'STRING',
          name: 'reason',
          nameLocalizations: { 'pt-BR': 'motivo' },
          description: 'Is there any special reasons for this hug?',
          descriptionLocalizations: { 'pt-BR': 'Tem um motivo em especial para abraçar?' },
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
    const selectedImage = await HttpRequests.getAssetImageUrl('hug');

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
