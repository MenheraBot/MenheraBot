import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageComponentInteraction } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import Util from '@utils/Util';
import moment from 'moment';

export default class MarryCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'marry',
      nameLocalizations: { 'pt-BR': 'casar' },
      description: '「💍」・Marry the love of your life',
      descriptionLocalizations: { 'pt-BR': '「💍」・Case com o amor de sua vida' },
      options: [
        {
          type: 'USER',
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          description: 'The lucky one who will marry you',
          descriptionLocalizations: { 'pt-BR': 'O sortudo que vai casar com você' },
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 8,
      authorDataFields: ['married'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    const mencionado = ctx.options.getUser('user', true);

    if (mencionado.bot) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.bot'),
        ephemeral: true,
      });
      return;
    }
    if (mencionado.id === ctx.author.id) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.self-mention'),
        ephemeral: true,
      });
      return;
    }

    if (authorData.married) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.married'),
        ephemeral: true,
      });
      return;
    }

    const user2 = await ctx.client.repositories.userRepository.find(mencionado.id, [
      'married',
      'ban',
    ]);

    if (!user2) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:casar.no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (user2.ban === true) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (user2.married) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.mention-married'),
        ephemeral: true,
      });
      return;
    }

    const ConfirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CONFIRM`)
      .setLabel(ctx.locale('commands:casar.accept'))
      .setStyle('SUCCESS');

    const CancellButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} CANCEL`)
      .setLabel(ctx.locale('commands:casar.deny'))
      .setStyle('DANGER');

    ctx.makeMessage({
      content: ctx.locale('commands:casar.first-text', {
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
        content: `${emojis.error} | ${ctx.locale('commands:casar.negated', {
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
      content: `${emojis.ring} | ${ctx.locale('commands:casar.accepted', {
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

    await ctx.client.repositories.relationshipRepository.marry(
      ctx.author.id,
      mencionado.id,
      dataFormated,
    );
  }
}
