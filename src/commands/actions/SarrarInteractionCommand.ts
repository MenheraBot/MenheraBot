import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction, MessageEmbed, User } from 'discord.js-light';
import Util from '@utils/Util';
import HttpRequests from '@utils/HTTPrequests';

export default class SarrarInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'sarrar',
      description: '「🦧」・Invoca o poder dos irmãos Berti para fazer a lendária sarrada',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Convoque alguém para sarrar contigo',
          required: false,
        },
      ],
      category: 'actions',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  static async sarrada(ctx: InteractionCommandContext, user: User): Promise<void> {
    const selectedImage = await HttpRequests.getAssetImageUrl('sarrar');

    const avatar = ctx.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate('embed_description', {
          author: ctx.author.toString(),
          mention: user.toString(),
        }),
      )
      .setImage(selectedImage)
      .setThumbnail(avatar);

    if (ctx.interaction.replied) ctx.makeMessage({ embeds: [embed], components: [] });
    else ctx.makeMessage({ embeds: [embed], components: [] });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user');

    if (user && user.id !== ctx.author.id) {
      SarrarInteractionCommand.sarrada(ctx, user);
      return;
    }

    const randSozinho = await HttpRequests.getAssetImageUrl('sarrar_sozinho');
    const embed = new MessageEmbed()
      .setTitle(ctx.translate('no-mention.embed_title'))
      .setColor(COLORS.ACTIONS)
      .setDescription(
        ctx.translate('no-mention.embed_description', {
          author: ctx.author.toString(),
        }),
      )
      .setImage(randSozinho)
      .setThumbnail(ctx.author.displayAvatarURL())
      .setFooter(ctx.translate('no-mention.embed_footer'));

    const Button = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.translate('sarrar'))
      .setStyle('PRIMARY');

    ctx.makeMessage({
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [Button] }],
    });

    const filter = async (int: MessageComponentInteraction) => {
      if (int.user.bot) return false;
      if (int.customId !== ctx.interaction.id) return false;
      if (int.user.id === ctx.author.id) return false;

      const isUserbanned = await this.client.repositories.blacklistRepository.isUserBanned(
        int.user.id,
      );

      return !isUserbanned;
    };

    const collected = await Util.collectComponentInteractionWithCustomFilter(
      ctx.channel,
      filter,
      30000,
    ).catch(() => null);

    if (!collected) {
      ctx.makeMessage({
        embeds: [embed],
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              Button.setDisabled(true).setLabel(ctx.locale('common:timesup')).setStyle('SECONDARY'),
            ],
          },
        ],
      });
      return;
    }

    SarrarInteractionCommand.sarrada(ctx, collected.user);
  }
}
