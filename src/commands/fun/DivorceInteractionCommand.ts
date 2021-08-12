import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction } from 'discord.js';
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
      await ctx.replyT('warn', 'commands:divorce.author-single', {}, true);
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CONFIRM`)
      .setLabel(ctx.locale('commands:divorce.divorce'))
      .setStyle('SUCCESS');

    const CancellButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CANCEL`)
      .setLabel(ctx.locale('commands:divorce:cancell'))
      .setStyle('DANGER');

    ctx.reply({
      content: `${emojis.question} | ${ctx.locale('commands:divorce.confirmation')} <@${
        authorData.casado
      }> ?`,
      components: [{ type: 1, components: [ConfirmButton, CancellButton] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.interaction.user.id;

    const collected = await Util.collectComponentInteractionWithCustomFilter(
      ctx.channel,
      filter,
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
        content: `${emojis.success} | ${ctx.locale('commands:divorce.confirmed', {
          author: ctx.interaction.user.toString(),
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
        ctx.interaction.user.id,
      );
    } else {
      ctx.editReply({
        content: `${emojis.error} | ${ctx.locale('commands:divorce.canceled')}`,
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
