import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';
import moment from 'moment';

export default class MarryInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'casar',
      description: '「💍」・Case com o amor de sua vida',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'O sortudo que vai casar com você',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 8,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    const mencionado = ctx.options.getUser('user', true);

    if (mencionado.bot) {
      await ctx.replyT('error', 'bot', {}, true);
      return;
    }
    if (mencionado.id === ctx.author.id) {
      await ctx.replyT('error', 'self-mention', {}, true);
      return;
    }

    if (authorData.casado && authorData.casado !== 'false') {
      await ctx.replyT('error', 'married', {}, true);
      return;
    }

    const user2 = await this.client.repositories.userRepository.find(mencionado.id);

    if (!user2) {
      await ctx.replyT('warn', 'no-dbuser', {}, true);
      return;
    }

    if (user2.casado && user2.casado !== 'false') {
      await ctx.replyT('error', 'mention-married', {}, true);
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CONFIRM`)
      .setLabel(ctx.translate('accept'))
      .setStyle('SUCCESS');

    const CancellButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CANCEL`)
      .setLabel(ctx.translate('deny'))
      .setStyle('DANGER');

    ctx.reply({
      content: ctx.translate('first-text', {
        author: ctx.author.toString(),
        toMarry: mencionado.toString(),
      }),
      components: [{ type: 1, components: [ConfirmButton, CancellButton] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === mencionado.id;

    const collected = await Util.collectComponentInteractionWithCustomFilter(
      ctx.channel,
      filter,
      30000,
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

    if (collected.customId.endsWith('CANCEL')) {
      ctx.editReply({
        content: `${emojis.error} | ${ctx.translate('negated', {
          toMarry: mencionado.toString(),
          author: ctx.author.toString(),
        })}`,
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
      return;
    }

    ctx.editReply({
      content: `${emojis.ring} | ${ctx.translate('accepted', {
        toMarry: mencionado.toString(),
        author: ctx.author.toString(),
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

    moment.locale('pt-br');

    const dataFormated = moment(Date.now()).format('l LTS');

    await this.client.repositories.relationshipRepository.marry(
      ctx.author.id,
      mencionado.id,
      dataFormated,
    );
  }
}
