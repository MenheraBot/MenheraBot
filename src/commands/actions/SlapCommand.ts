import { COLORS, TODAYS_YEAR } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize } from '@utils/Util';

export default class SlapCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'tapa',
      nameLocalizations: { 'en-US': 'slap' },
      description: '「🖐️」・Da um tapão de arrancar tumor em alguém',
      descriptionLocalizations: { 'en-US': '「🖐️」・Give someone a tumor-pulling slap' },
      options: [
        {
          name: 'usuário',
          nameLocalizations: { 'en-US': 'user' },
          type: 'USER',
          description: 'Usuário pra mete o tapa',
          descriptionLocalizations: { 'en-US': 'User to slap' },
          required: true,
        },
        {
          name: 'motivo',
          nameLocalizations: { 'en-US': 'reason' },
          type: 'STRING',
          description: 'Por que tu quer fazer isso?',
          descriptionLocalizations: { 'en-US': 'Why do you wanna do that?' },
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
        content: ctx.prettyResponse('error', 'commands:tapa.bot'),
      });
      return;
    }

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:tapa.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('slap');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:tapa.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:tapa.embed_description', {
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
