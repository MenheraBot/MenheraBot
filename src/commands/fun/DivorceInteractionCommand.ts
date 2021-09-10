import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js';
import { emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';

export default class DivorceInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'divorciar',
      description: '「💔」・Divorcie de seu atual cônjuje',
      category: 'fun',
      cooldown: 8,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    if (!authorData.casado || authorData.casado === 'false') {
      await ctx.replyT('warn', 'author-single', {}, true);
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CONFIRM`)
      .setLabel(ctx.translate('divorce'))
      .setStyle('SUCCESS');

    const CancellButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CANCEL`)
      .setLabel(ctx.translate('cancel'))
      .setStyle('DANGER');

    ctx.reply({
      content: `${emojis.question} | ${ctx.translate('confirmation')} <@${authorData.casado}> ?`,
      components: [{ type: 1, components: [ConfirmButton, CancellButton] }],
    });

    const collected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15000,
    );

    if (!collected) {
      ctx.editReply({
        components: [
          {
            type: 1,
            components: [
              ConfirmButton.setDisabled(true).setStyle('SECONDARY'),
              CancellButton.setDisabled(true).setStyle('SECONDARY'),
            ],
          },
        ],
      });
      return;
    }

    if (collected.customId.endsWith('CONFIRM')) {
      ctx.editReply({
        content: `${emojis.success} | ${ctx.translate('confirmed', {
          author: ctx.author.toString(),
          mention: `<@${authorData.casado}>`,
        })}`,
        components: [
          {
            type: 1,
            components: [
              ConfirmButton.setDisabled(true).setStyle('PRIMARY'),
              CancellButton.setDisabled(true).setStyle('SECONDARY'),
            ],
          },
        ],
      });

      await this.client.repositories.relationshipRepository.divorce(
        ctx.data.user.casado,
        ctx.author.id,
      );
    } else {
      ctx.editReply({
        content: `${emojis.error} | ${ctx.translate('canceled')}`,
        components: [
          {
            type: 1,
            components: [
              ConfirmButton.setDisabled(true).setStyle('SECONDARY'),
              CancellButton.setDisabled(true).setStyle('PRIMARY'),
            ],
          },
        ],
      });
    }
  }
}
