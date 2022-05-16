import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class KissInteractionCommand extends InteractionCommand {
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
          descriptionLocalizations: { 'en-US': 'place you want to kiss' },
          required: true,
          choices: [
            { name: '👄 | Boca', value: '0', nameLocalizations: { 'en-US': '👄 | Mouth' } },
            { name: '🌸 | Bochecha', value: '1', nameLocalizations: { 'en-US': '🌸 | Cheek' } },
          ],
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

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
      ctx.options.getString('local', true) === '0'
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

    await ctx.makeMessage({ embeds: [embed] });
  }
}
