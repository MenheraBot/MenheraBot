import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class PokeInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cutucar',
      nameLocalizations: { 'en-US': 'poke' },
      description: '「👉」・Da uma cutucadinha em alguém',
      descriptionLocalizations: { 'en-US': '「👉」・Give someone a little poke' },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que você quer cutucar',
          descriptionLocalizations: { 'en-US': 'User you want to poke' },
          required: true,
        },
      ],
      category: 'actions',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    if (user.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:cutucar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    const selectedImage = await HttpRequests.getAssetImageUrl('poke');
    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:cutucar.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.locale('commands:cutucar.embed_description', {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    await ctx.makeMessage({ embeds: [embed] });
  }
}
