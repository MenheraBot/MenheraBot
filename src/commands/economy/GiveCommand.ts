import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';

import { emojis } from '@structures/MenheraConstants';
import { IUserSchema } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import { Message } from 'discord.js';

const validArgs = [
  {
    opção: 'estrelinhas',
    arguments: ['estrelinhas', 'stars', 'star', 'estrelas'],
  },
  {
    opção: 'demônio',
    arguments: ['demonios', 'demônios', 'demons', 'demonio', 'demônio'],
  },
  {
    opção: 'anjos',
    arguments: ['anjos', 'anjo', 'angels'],
  },
  {
    opção: 'semideuses',
    arguments: [
      'semideuses',
      'semideus',
      'semi-deuses',
      'sd',
      'semi-deus',
      'demigods',
      'dg',
      'demigod',
    ],
  },
  {
    opção: 'deus',
    arguments: ['deus', 'deuses', 'gods', 'god'],
  },
];

export default class GiveCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'give',
      aliases: ['pay', 'pagar'],
      cooldown: 5,
      category: 'economia',
    });
  }

  static replyInvalidArgsError(ctx: CommandContext): Promise<Message> {
    return ctx.replyT('error', 'commands:give.no-args', { prefix: ctx.data.server.prefix });
  }

  static replyBadUsageError(ctx: CommandContext): Promise<Message> {
    return ctx.replyT('error', 'commands:give.bad-usage');
  }

  static replyForYourselfError(ctx: CommandContext): Promise<Message> {
    return ctx.replyT('error', 'commands:give.self-mention');
  }

  static replyInvalidValueError(ctx: CommandContext): Promise<Message> {
    return ctx.replyT('error', 'commands:give.invalid-value');
  }

  static replyNoAccountError(ctx: CommandContext): Promise<Message> {
    return ctx.replyT('error', 'commands:give.no-dbuser');
  }

  static replyNotEnoughtError(ctx: CommandContext, localeField: string): Promise<Message> {
    return ctx.reply(
      'error',
      `${ctx.locale('commands:give.poor')} ${ctx.locale(`commands:give.${localeField}`)}`,
    );
  }

  static replySuccess(
    ctx: CommandContext,
    value: number,
    emoji: string,
    mentionString: string,
  ): Promise<Message> {
    return ctx.reply(
      'success',
      `${ctx.locale('commands:give.transfered', { value, emoji })} ${mentionString}`,
    );
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const selectedOption =
      ctx.args[0] &&
      validArgs.find((option) => option.arguments.includes(ctx.args[0].toLowerCase()));
    if (!selectedOption) return GiveCommand.replyInvalidArgsError(ctx);

    const to = ctx.message.mentions.users.first();
    if (!to) return GiveCommand.replyBadUsageError(ctx);
    if (to.bot) return GiveCommand.replyNoAccountError(ctx);
    if (to.id === ctx.message.author.id) return GiveCommand.replyForYourselfError(ctx);

    const input = ctx.args[2];
    if (!input) return GiveCommand.replyBadUsageError(ctx);

    const value = parseInt(input.replace(/\D+/g, ''));
    if (!value || value < 1) return GiveCommand.replyInvalidValueError(ctx);

    const toData = await this.client.repositories.userRepository.findOrCreate(to.id);
    if (!toData) return GiveCommand.replyNoAccountError(ctx);

    const authorData = ctx.data.user;
    const option = selectedOption.opção;

    switch (option) {
      case 'estrelinhas':
        await this.giveStar(authorData, toData, value, ctx, to.toString());
        break;
      case 'demônio':
        await this.giveDemon(authorData, toData, value, ctx, to.toString());
        break;
      case 'anjos':
        await this.giveAngel(authorData, toData, value, ctx, to.toString());
        break;
      case 'semideuses':
        await this.giveSD(authorData, toData, value, ctx, to.toString());
        break;
      case 'deus':
        await this.giveGod(authorData, toData, value, ctx, to.toString());
        break;
    }
  }

  async giveStar(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: CommandContext,
    mentionString: string,
  ): Promise<Message> {
    if (value > from.estrelinhas) return GiveCommand.replyNotEnoughtError(ctx, 'stars');

    await this.client.repositories.giveRepository.giveStars(from.id, to.id, value);

    return GiveCommand.replySuccess(ctx, value, emojis.star, mentionString);
  }

  async giveDemon(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: CommandContext,
    mentionString: string,
  ): Promise<Message> {
    if (value > from.caçados) return GiveCommand.replyNotEnoughtError(ctx, 'demons');

    await this.client.repositories.giveRepository.giveDemons(from.id, to.id, value);

    return GiveCommand.replySuccess(ctx, value, emojis.demon, mentionString);
  }

  async giveAngel(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: CommandContext,
    mentionString: string,
  ): Promise<Message> {
    if (value > from.anjos) return GiveCommand.replyNotEnoughtError(ctx, 'angels');

    await this.client.repositories.giveRepository.giveAngels(from.id, to.id, value);

    return GiveCommand.replySuccess(ctx, value, emojis.angel, mentionString);
  }

  async giveSD(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: CommandContext,
    mentionString: string,
  ): Promise<Message> {
    if (value > from.semideuses) return GiveCommand.replyNotEnoughtError(ctx, 'semigods');

    await this.client.repositories.giveRepository.giveDemigods(from.id, to.id, value);

    return GiveCommand.replySuccess(ctx, value, emojis.semigod, mentionString);
  }

  async giveGod(
    from: IUserSchema,
    to: IUserSchema,
    value: number,
    ctx: CommandContext,
    mentionString: string,
  ): Promise<Message> {
    if (value > from.deuses) return GiveCommand.replyNotEnoughtError(ctx, 'gods');

    await this.client.repositories.giveRepository.giveGods(from.id, to.id, value);

    return GiveCommand.replySuccess(ctx, value, emojis.god, mentionString);
  }
}
