import { emojis } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, ApplicationCommandOptionChoiceData } from 'discord.js-light';
import Util, { disableComponents, resolveCustomId } from '@utils/Util';
import { HuntingTypes } from '@custom_types/Menhera';

type ChoiceTypes = HuntingTypes | 'estrelinhas';
const choices: Array<ApplicationCommandOptionChoiceData & { value: ChoiceTypes }> = [
  {
    name: '⭐ | Start',
    nameLocalizations: { 'pt-BR': '⭐ | Estrelinhas' },
    value: 'estrelinhas',
  },
  {
    name: '😈 | Demons',
    nameLocalizations: { 'pt-BR': '😈 | Demônios' },
    value: 'demons',
  },
  {
    name: '👊 | Giants',
    nameLocalizations: { 'pt-BR': '👊 | Gigantes' },
    value: 'giants',
  },
  {
    name: '👼 | Angels',
    nameLocalizations: { 'pt-BR': '👼 | Anjos' },
    value: 'angels',
  },
  {
    name: '🧚‍♂️ | Archangels',
    nameLocalizations: { 'pt-BR': '🧚‍♂️ | Arcanjos' },
    value: 'archangels',
  },
  {
    name: '🙌 | Demigods',
    nameLocalizations: { 'pt-BR': '🙌 | Semideuses' },
    value: 'demigods',
  },
  {
    name: '✝️ | Gods',
    nameLocalizations: { 'pt-BR': '✝️ | Deuses' },
    value: 'gods',
  },
];
export default class GiveCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'gift',
      nameLocalizations: { 'pt-BR': 'presentear' },
      description: '「🎁」・Give someone else a gift from your inventory',
      descriptionLocalizations: {
        'pt-BR': '「🎁」・Dê um presente de seu inventário para outra pessoa',
      },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          description: 'User to gift',
          descriptionLocalizations: { 'pt-BR': 'Usuário para presentear' },
          type: 'USER',
          required: true,
        },
        {
          name: 'type',
          nameLocalizations: { 'pt-BR': 'tipo' },
          description: 'The type of item you want to gift',
          descriptionLocalizations: { 'pt-BR': 'O tipo de item que quer presentear' },
          type: 'STRING',
          choices,
          required: true,
        },
        {
          name: 'amount',
          nameLocalizations: { 'pt-BR': 'quantidade' },
          description: 'The amount to gift',
          descriptionLocalizations: { 'pt-BR': 'A quantidade para presentear' },
          type: 'INTEGER',
          required: true,
          minValue: 1,
        },
      ],
      cooldown: 5,
      category: 'economy',
      authorDataFields: [
        'estrelinhas',
        'demons',
        'giants',
        'angels',
        'archangels',
        'gods',
        'demigods',
      ],
    });
  }

  static replyForYourselfError(ctx: InteractionCommandContext): void {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:presentear.self-mention'),
      ephemeral: true,
    });
  }

  static replyInvalidValueError(ctx: InteractionCommandContext): void {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:presentear.invalid-value'),
      ephemeral: true,
    });
  }

  static replyNoAccountError(ctx: InteractionCommandContext): void {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:presentear.no-dbuser'),
      ephemeral: true,
    });
  }

  static replyNotEnoughtError(ctx: InteractionCommandContext, localeField: ChoiceTypes): void {
    ctx.deleteReply();
    ctx.send({
      content: ctx.prettyResponse('error', 'commands:presentear.poor', {
        field: ctx.locale(`common:${localeField}`),
      }),
    });
  }

  static replySuccess(
    ctx: InteractionCommandContext,
    value: number,
    emoji: string,
    mentionString: string,
  ): void {
    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('success', 'commands:presentear.transfered', {
        value,
        emoji,
        user: mentionString,
      }),
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const [toSendUser, selectedOption, input] = [
      ctx.options.getUser('user', true),
      ctx.options.getString('type', true) as ChoiceTypes,
      ctx.options.getInteger('amount', true),
    ];

    if (toSendUser.id === ctx.author.id) return GiveCommand.replyForYourselfError(ctx);

    if (input < 1) return GiveCommand.replyInvalidValueError(ctx);

    if (ctx.client.economyUsages.has(toSendUser.id)) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:economy_usage'),
        ephemeral: true,
      });
      return;
    }

    if (await ctx.client.repositories.blacklistRepository.isUserBanned(toSendUser.id)) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:presentear.banned-user'),
        ephemeral: true,
      });
      return;
    }

    if (!toSendUser.bot) {
      const confirmButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | ACCEPT`)
        .setStyle('SUCCESS')
        .setLabel(ctx.locale('common:accept'));

      const negateButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | NEGATE`)
        .setStyle('DANGER')
        .setLabel(ctx.locale('common:negate'));

      ctx.client.economyUsages.add(toSendUser.id);

      await ctx.makeMessage({
        content: ctx.prettyResponse('question', 'commands:presentear.confirm', {
          user: toSendUser.toString(),
          author: ctx.author.toString(),
          count: input,
          emoji: emojis[selectedOption],
        }),
        components: [{ type: 'ACTION_ROW', components: [confirmButton, negateButton] }],
      });

      const selectedButton = await Util.collectComponentInteractionWithStartingId(
        ctx.channel,
        toSendUser.id,
        ctx.interaction.id,
      );

      ctx.client.economyUsages.delete(toSendUser.id);

      if (!selectedButton) {
        ctx.makeMessage({
          components: [
            {
              type: 'ACTION_ROW',
              components: disableComponents(ctx.locale('common:timesup'), [
                confirmButton,
                negateButton,
              ]),
            },
          ],
        });
        return;
      }

      if (resolveCustomId(selectedButton.customId) === 'NEGATE') {
        ctx.makeMessage({
          content: ctx.locale('commands:presentear.negated', { user: toSendUser.toString() }),
          components: [
            {
              type: 'ACTION_ROW',
              components: [
                confirmButton.setDisabled(true).setStyle('SECONDARY'),
                negateButton.setDisabled(true),
              ],
            },
          ],
        });
        return;
      }
    }

    if (input > ctx.data.user[selectedOption])
      return GiveCommand.replyNotEnoughtError(ctx, selectedOption);

    ctx.client.repositories.giveRepository.executeGive(
      selectedOption,
      ctx.author.id,
      toSendUser.id,
      input,
    );

    GiveCommand.replySuccess(ctx, input, emojis[selectedOption], toSendUser.toString());
  }
}
