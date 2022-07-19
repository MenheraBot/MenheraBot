import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import Util from '@utils/Util';

export default class DivorceCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'divorciar',
      nameLocalizations: { 'en-US': 'divorce' },
      description: '「💔」・Divorcie de seu atual cônjuje',
      descriptionLocalizations: { 'en-US': '「💔」・Divorce from your current spouse' },
      category: 'fun',
      cooldown: 8,
      authorDataFields: ['married'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    if (!authorData.married) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:divorciar.author-single'),
        ephemeral: true,
      });
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CONFIRM`)
      .setLabel(ctx.locale('commands:divorciar.divorce'))
      .setStyle('SUCCESS');

    const CancellButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CANCEL`)
      .setLabel(ctx.locale('commands:divorciar.cancel'))
      .setStyle('DANGER');

    ctx.makeMessage({
      content: `${emojis.question} | ${ctx.locale('commands:divorciar.confirmation')} <@${
        authorData.married
      }> ?`,
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
        content: `${emojis.success} | ${ctx.locale('commands:divorciar.confirmed', {
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

      await ctx.client.repositories.relationshipRepository.divorce(
        authorData.married,
        ctx.author.id,
      );
    } else {
      ctx.makeMessage({
        content: `${emojis.error} | ${ctx.locale('commands:divorciar.canceled')}`,
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