import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction } from 'discord.js-light';
import { emojis } from '@structures/Constants';
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
      authorDataFields: ['casado'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    const mencionado = ctx.options.getUser('user', true);

    if (mencionado.bot) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'bot'), ephemeral: true });
      return;
    }
    if (mencionado.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (authorData.casado && authorData.casado !== 'false') {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'married'), ephemeral: true });
      return;
    }

    const user2 = await this.client.repositories.userRepository.find(mencionado.id);

    if (!user2) {
      await ctx.makeMessage({ content: ctx.prettyResponse('warn', 'no-dbuser'), ephemeral: true });
      return;
    }

    if (user2.ban === true) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (user2.casado && user2.casado !== 'false') {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'mention-married'),
        ephemeral: true,
      });
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

    ctx.makeMessage({
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

    if (collected.customId.endsWith('CANCEL')) {
      ctx.makeMessage({
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

    ctx.makeMessage({
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
