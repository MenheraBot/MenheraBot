import { emojis } from '@structures/Constants';
import { IUserSchema } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

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
              value: 'estrelinhas',
            },
            {
              name: '😈 | Demônios',
              value: 'demônio',
            },
            {
              name: '👊 | Gigantes',
              value: 'gigantes',
            },
            {
              name: '👼 | Anjos',
              value: 'anjos',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              value: 'arcanjos',
            },
            {
              name: '🙌 | Semideuses',
              value: 'semideuses',
            },
            {
              name: '✝️ | Deuses',
              value: 'deus',
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

  static replyBadUsageError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'bad-usage', {}, true);
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
    ctx.replyE('error', `${ctx.translate('poor')} ${ctx.translate(localeField)}`, true);
  }

  static replySuccess(
    ctx: InteractionCommandContext,
    value: number,
    emoji: string,
    mentionString: string,
  ): void {
    ctx.replyE('success', `${ctx.translate('transfered', { value, emoji })} ${mentionString}`);
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const [user, selectedOption, input] = [
      ctx.options.getUser('user', true),
      ctx.options.getString('tipo', true),
      ctx.options.getInteger('valor', true),
    ];

    const to = user;
    if (!to) {
      GiveInteractionCommand.replyBadUsageError(ctx);
      return;
    }
    if (to.bot) {
      GiveInteractionCommand.replyNoAccountError(ctx);
      return;
    }

    if (to.id === ctx.author.id) {
      GiveInteractionCommand.replyForYourselfError(ctx);
      return;
    }

    if (await this.client.repositories.blacklistRepository.isUserBanned(to.id)) {
      ctx.replyT('error', 'banned-user', {}, true);
      return;
    }

    if (!input) {
      GiveInteractionCommand.replyBadUsageError(ctx);
      return;
    }

    if (input < 1) {
      GiveInteractionCommand.replyInvalidValueError(ctx);
      return;
    }

    const toData = await this.client.repositories.userRepository.findOrCreate(to.id);
    if (!toData) {
      GiveInteractionCommand.replyNoAccountError(ctx);
      return;
    }

    const authorData = ctx.data.user;

    switch (selectedOption) {
      case 'estrelinhas':
        await this.giveStar(authorData, toData, input, ctx, to.toString());
        break;
      case 'demônio':
        await this.giveDemon(authorData, toData, input, ctx, to.toString());
        break;
      case 'gigantes':
        await this.giveGiant(authorData, toData, input, ctx, to.toString());
        break;
      case 'anjos':
        await this.giveAngel(authorData, toData, input, ctx, to.toString());
        break;
      case 'arcanjos':
        await this.giveArchangel(authorData, toData, input, ctx, to.toString());
        break;
      case 'semideuses':
        await this.giveSD(authorData, toData, input, ctx, to.toString());
        break;
      case 'deus':
        await this.giveGod(authorData, toData, input, ctx, to.toString());
        break;
    }
  }

  async giveGiant(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.giants) return GiveInteractionCommand.replyNotEnoughtError(ctx, 'giants');

    await this.client.repositories.giveRepository.giveGiants(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.giant, mentionString);
  }

  async giveArchangel(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.arcanjos) return GiveInteractionCommand.replyNotEnoughtError(ctx, 'archangel');

    await this.client.repositories.giveRepository.giveArchangel(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.archangel, mentionString);
  }

  async giveStar(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.estrelinhas) return GiveInteractionCommand.replyNotEnoughtError(ctx, 'stars');

    await this.client.repositories.giveRepository.giveStars(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.star, mentionString);
  }

  async giveDemon(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.caçados) return GiveInteractionCommand.replyNotEnoughtError(ctx, 'demons');

    await this.client.repositories.giveRepository.giveDemons(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.demon, mentionString);
  }

  async giveAngel(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.anjos) return GiveInteractionCommand.replyNotEnoughtError(ctx, 'angels');

    await this.client.repositories.giveRepository.giveAngels(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.angel, mentionString);
  }

  async giveSD(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.semideuses)
      return GiveInteractionCommand.replyNotEnoughtError(ctx, 'semigods');

    await this.client.repositories.giveRepository.giveDemigods(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.semigod, mentionString);
  }

  async giveGod(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: InteractionCommandContext,
    mentionString: string,
  ): Promise<void> {
    if (value > from.deuses) return GiveInteractionCommand.replyNotEnoughtError(ctx, 'gods');

    await this.client.repositories.giveRepository.giveGods(from.id, to.id, value);

    return GiveInteractionCommand.replySuccess(ctx, value, emojis.god, mentionString);
  }
}
