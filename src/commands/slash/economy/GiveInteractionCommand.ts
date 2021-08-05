import { emojis } from '@structures/MenheraConstants';
import { IUserSchema } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/InteractionCommand';
import InteractionCommandContext from '@structures/InteractionContext';

export default class GiveInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'give',
      description: 'Transfira algo de seu inventário para alguém',
      options: [
        {
          name: 'user',
          description: 'Usuário para transferir',
          type: 6,
          required: true,
        },
        {
          name: 'tipo',
          description: 'O tipo de item que quer transferir',
          type: 3,
          choices: [
            {
              name: 'Estrelinhas',
              value: 'estrelinhas',
            },
            {
              name: 'Demônios',
              value: 'demônio',
            },
            {
              name: 'Anjos',
              value: 'anjos',
            },
            {
              name: 'SemiDeuses',
              value: 'semideuses',
            },
            {
              name: 'Deuses',
              value: 'deus',
            },
          ],
          required: true,
        },
        {
          name: 'valor',
          description: 'A quantidade para transferir',
          type: 4,
          required: true,
        },
      ],
      cooldown: 5,
      category: 'economia',
    });
  }

  static replyInvalidArgsError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'commands:give.no-args', { prefix: ctx.data.server.prefix }, true);
  }

  static replyBadUsageError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'commands:give.bad-usage', {}, true);
  }

  static replyForYourselfError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'commands:give.self-mention', {}, true);
  }

  static replyInvalidValueError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'commands:give.invalid-value', {}, true);
  }

  static replyNoAccountError(ctx: InteractionCommandContext): void {
    ctx.replyT('error', 'commands:give.no-dbuser', {}, true);
  }

  static replyNotEnoughtError(ctx: InteractionCommandContext, localeField: string): void {
    ctx.replyE(
      'error',
      `${ctx.locale('commands:give.poor')} ${ctx.locale(`commands:give.${localeField}`)}`,
      true,
    );
  }

  static replySuccess(
    ctx: InteractionCommandContext,
    value: number,
    emoji: string,
    mentionString: string,
  ): void {
    ctx.replyE(
      'success',
      `${ctx.locale('commands:give.transfered', { value, emoji })} ${mentionString}`,
    );
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const [user, selectedOption, input] = ctx.args;
    if (!selectedOption) {
      GiveInteractionCommand.replyInvalidArgsError(ctx);
      return;
    }

    const to = user.user;
    if (!to) {
      GiveInteractionCommand.replyBadUsageError(ctx);
      return;
    }
    if (to.bot) {
      GiveInteractionCommand.replyNoAccountError(ctx);
      return;
    }

    if (to.id === ctx.interaction.user.id) {
      GiveInteractionCommand.replyForYourselfError(ctx);
      return;
    }

    if (!input || !input.value) {
      GiveInteractionCommand.replyBadUsageError(ctx);
      return;
    }

    if ((input.value as number) < 1) {
      GiveInteractionCommand.replyInvalidValueError(ctx);
      return;
    }

    const toData = await this.client.repositories.userRepository.findOrCreate(to.id);
    if (!toData) {
      GiveInteractionCommand.replyNoAccountError(ctx);
      return;
    }

    const authorData = ctx.data.user;

    switch (selectedOption.value) {
      case 'estrelinhas':
        await this.giveStar(authorData, toData, input.value as number, ctx, to.toString());
        break;
      case 'demônio':
        await this.giveDemon(authorData, toData, input.value as number, ctx, to.toString());
        break;
      case 'anjos':
        await this.giveAngel(authorData, toData, input.value as number, ctx, to.toString());
        break;
      case 'semideuses':
        await this.giveSD(authorData, toData, input.value as number, ctx, to.toString());
        break;
      case 'deus':
        await this.giveGod(authorData, toData, input.value as number, ctx, to.toString());
        break;
    }
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
