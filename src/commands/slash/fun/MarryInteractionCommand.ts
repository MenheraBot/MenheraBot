import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction, TextBasedChannels, User } from 'discord.js';
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

    const mencionado = ctx.args[0].user as User;

    if (mencionado.bot) {
      await ctx.replyT('error', 'commands:marry.bot', {}, true);
      return;
    }
    if (mencionado.id === ctx.interaction.user.id) {
      await ctx.replyT('error', 'commands:marry.self-mention', {}, true);
      return;
    }

    if (authorData.casado && authorData.casado !== 'false') {
      await ctx.replyT('error', 'commands:marry.married', {}, true);
      return;
    }

    const user2 = await this.client.repositories.userRepository.find(mencionado.id);

    if (!user2) {
      await ctx.replyT('warn', 'commands:marry.no-dbuser', {}, true);
      return;
    }

    if (user2.casado && user2.casado !== 'false') {
      await ctx.replyT('error', 'commands:marry.mention-married', {}, true);
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CONFIRM`)
      .setLabel(ctx.locale('commands:marry.accept'))
      .setStyle('SUCCESS');

    const CancellButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CANCEL`)
      .setLabel(ctx.locale('commands:marry:deny'))
      .setStyle('DANGER');

    ctx.reply({
      content: ctx.locale('commands:marry.first-text', {
        author: ctx.interaction.user.toString(),
        toMarry: mencionado.toString(),
      }),
      components: [{ type: 1, components: [ConfirmButton, CancellButton] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === mencionado.id;

    const collected = await Util.collectComponentInteractionWithCustomFilter(
      ctx.interaction.channel as TextBasedChannels,
      filter,
      30000,
    );

    if (!collected) {
      ctx.editReply({
        content: (await ctx.interaction.fetchReply()).content,
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
        content: `${emojis.error} | ${ctx.locale('commands:marry.negated', {
          toMarry: mencionado.toString(),
          author: ctx.interaction.user.toString(),
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
      content: `${emojis.ring} | ${ctx.locale('commands:marry.accepted', {
        toMarry: mencionado.toString(),
        author: ctx.interaction.user.toString(),
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
      ctx.interaction.user.id,
      mencionado.id,
      dataFormated,
    );
  }
}
