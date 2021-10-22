import { emojis, EmojiTypes } from '@structures/MenheraConstants';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
import Util, { disableComponents, resolveCustomId } from '@utils/Util';

export default class GiveInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'give',
      description: '「🎁」・Transfira algo de seu inventário para alguém',
      options: [
        {
          name: 'user',
          description: 'Usuário para transferir',
          type: 'USER',
          required: true,
        },
        {
          name: 'tipo',
          description: 'O tipo de item que quer transferir',
          type: 'STRING',
          choices: [
            {
              name: '⭐ | Estrelinhas',
              value: 'star',
            },
            {
              name: '😈 | Demônios',
              value: 'demon',
            },
            {
              name: '👊 | Gigantes',
              value: 'giant',
            },
            {
              name: '👼 | Anjos',
              value: 'angel',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              value: 'archangel',
            },
            {
              name: '🙌 | Semideuses',
              value: 'semigod',
            },
            {
              name: '✝️ | Deuses',
              value: 'god',
            },
          ],
          required: true,
        },
        {
          name: 'valor',
          description: 'A quantidade para transferir',
          type: 'INTEGER',
          required: true,
        },
      ],
      cooldown: 5,
      category: 'economia',
    });
  }

  static replyForYourselfError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'self-mention', {}, true);
  }

  static replyInvalidValueError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'invalid-value', {}, true);
  }

  static replyNoAccountError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'no-dbuser', {}, true);
  }

  static replyNotEnoughtError(ctx: InteractionCommandContext, localeField: string): void {
    ctx.deleteReply();
    ctx.send({
      content: ctx.prettyResponse('error', 'poor', { field: ctx.translate(localeField) }),
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
      content: ctx.prettyResponse('success', 'transfered', { value, emoji, user: mentionString }),
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const [toSendUser, selectedOption, input] = [
      ctx.options.getUser('user', true),
      ctx.options.getString('tipo', true) as EmojiTypes,
      ctx.options.getInteger('valor', true),
    ];

    if (toSendUser.bot) return GiveInteractionCommand.replyNoAccountError(ctx);

    if (toSendUser.id === ctx.author.id) return GiveInteractionCommand.replyForYourselfError(ctx);

    if (input < 1) return GiveInteractionCommand.replyInvalidValueError(ctx);

    if (await this.client.repositories.blacklistRepository.isUserBanned(toSendUser.id)) {
      ctx.replyT('error', 'banned-user', {}, true);
      return;
    }

    const confirmButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ACCEPT`)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('common:accept'));

    const negateButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEGATE`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('common:negate'));

    await ctx.makeMessage({
      content: ctx.translate('confirmar', {
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
        content: ctx.translate('negated', { user: toSendUser.toString() }),
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

    await this.client.repositories.userRepository.findOrCreate(toSendUser.id);

    const authorData = ctx.data.user;

    switch (selectedOption) {
      case 'star':
        if (input > authorData.estrelinhas)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'stars');

        await this.client.repositories.giveRepository.giveStars(
          authorData.id,
          toSendUser.id,
          input,
        );
        return GiveInteractionCommand.replySuccess(ctx, input, emojis.star, toSendUser.toString());
      case 'demon':
        if (input > authorData.caçados)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'demons');
        await this.client.repositories.giveRepository.giveDemons(
          authorData.id,
          toSendUser.id,
          input,
        );
        return GiveInteractionCommand.replySuccess(ctx, input, emojis.demon, toSendUser.toString());
        break;
      case 'giant':
        if (input > authorData.giants)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'giants');
        await this.client.repositories.giveRepository.giveGiants(
          authorData.id,
          toSendUser.id,
          input,
        );
        return GiveInteractionCommand.replySuccess(ctx, input, emojis.giant, toSendUser.toString());
      case 'angel':
        if (input > authorData.anjos)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'angels');

        await this.client.repositories.giveRepository.giveAngels(
          authorData.id,
          toSendUser.id,
          input,
        );

        return GiveInteractionCommand.replySuccess(ctx, input, emojis.angel, toSendUser.toString());
      case 'archangel':
        if (input > authorData.arcanjos)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'archangel');
        await this.client.repositories.giveRepository.giveArchangel(
          authorData.id,
          toSendUser.id,
          input,
        );
        return GiveInteractionCommand.replySuccess(
          ctx,
          input,
          emojis.archangel,
          toSendUser.toString(),
        );
      case 'semigod':
        if (input > authorData.semideuses)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'semigods');

        await this.client.repositories.giveRepository.giveDemigods(
          authorData.id,
          toSendUser.id,
          input,
        );

        return GiveInteractionCommand.replySuccess(
          ctx,
          input,
          emojis.semigod,
          toSendUser.toString(),
        );
      case 'god':
        if (input > authorData.deuses)
          return GiveInteractionCommand.replyNotEnoughtError(ctx, 'gods');

        await this.client.repositories.giveRepository.giveGods(authorData.id, toSendUser.id, input);

        return GiveInteractionCommand.replySuccess(ctx, input, emojis.god, toSendUser.toString());
    }
  }
}
