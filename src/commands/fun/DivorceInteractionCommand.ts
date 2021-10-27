import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import Util from '@utils/Util';

export default class DivorceInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'divorciar',
      description: '「💔」・Divorcie de seu atual cônjuje',
      category: 'fun',
      cooldown: 8,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['married'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    if (!authorData.married) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'author-single'),
        ephemeral: true,
      });
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

    ctx.makeMessage({
      content: `${emojis.question} | ${ctx.translate('confirmation')} <@${authorData.married}> ?`,
      components: [{ type: 1, components: [ConfirmButton, CancellButton] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

    const collected = await Util.collectComponentInteractionWithCustomFilter(
      ctx.channel,
      filter,
      15000,
    );

    if (!collected) {
      ctx.makeMessage({
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
      ctx.makeMessage({
        content: `${emojis.success} | ${ctx.translate('confirmed', {
          author: ctx.author.toString(),
          mention: `<@${authorData.married}>`,
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
        authorData.married,
        ctx.author.id,
      );
    } else {
      ctx.makeMessage({
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
