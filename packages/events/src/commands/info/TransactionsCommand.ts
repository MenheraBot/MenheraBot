/* eslint-disable no-nested-ternary */
import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import userRepository from '../../database/repositories/userRepository';
import { getDisplayName } from '../../utils/discord/userUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getUserTransactions } from '../../utils/apiRequests/statistics';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { bot } from '../..';
import { millisToSeconds } from '../../utils/miscUtils';
import cacheRepository from '../../database/repositories/cacheRepository';
import { EMOJIS } from '../../structures/constants';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const executeButtonClick = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [toFindUserId, page, embedColor] = ctx.sentData;

  const toFindUser = (await cacheRepository.getDiscordUser(toFindUserId)) ?? ctx.user;

  const noop = () => undefined;

  await ctx.ack();

  executeTransactionsCommand(ctx, toFindUser, Number(page), embedColor, noop);
};

const executeTransactionsCommand = async (
  ctx: ChatInputInteractionContext | ComponentInteractionContext,
  toFindUser: User,
  page: number,
  embedColor: string,
  finishCommand: (args?: unknown) => void,
): Promise<void> => {
  const transactions = await getUserTransactions(`${toFindUser.id}`, page);

  if (!transactions || transactions.length === 0)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:transactions.no-transactions', {
          user: getDisplayName(toFindUser),
        }),
        components: [],
        embeds: [],
      }),
    );

  const toResolve = transactions.reduce<Map<string, Promise<User | null>>>((map, c) => {
    if (!map.has(c.authorId))
      map.set(c.authorId, cacheRepository.getDiscordUser(c.authorId, false));

    if (!map.has(c.targetId))
      map.set(c.targetId, cacheRepository.getDiscordUser(c.targetId, false));

    return map;
  }, new Map<string, Promise<User | null>>());

  await Promise.all(toResolve.values());

  const parsedData = await Promise.all(
    transactions.map(async (a) => {
      const author = `${(await toResolve.get(a.authorId))?.username ?? '??'} - (${a.authorId})`;
      const target = `${(await toResolve.get(a.targetId))?.username ?? '??'} - (${a.targetId})`;

      const authorType =
        a.authorId === `${ctx.interaction.user.id}`
          ? 'you'
          : a.authorId === `${bot.id}`
          ? 'menhera'
          : 'user';

      const targetType =
        a.targetId === `${ctx.interaction.user.id}`
          ? 'you'
          : a.targetId === `${bot.id}`
          ? 'menhera'
          : 'user';

      const transactionType = `${authorType}_to_${targetType}` as const;

      return `${ctx.locale('commands:transactions.transactions.base', {
        unix: millisToSeconds(a.date),
      })}${ctx.locale(`commands:transactions.transactions.${transactionType}`, {
        author,
        target,
        emoji: EMOJIS[a.currencyType],
        amount: a.amount,
        currencyType: ctx.locale(`common:${a.currencyType}`),
        reason: ctx.locale(`commands:transactions.reasons.${a.reason}`),
      })}`;
    }),
  );

  const backButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      toFindUser.id,
      page === 0 ? 1 : page - 1,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:back'),
    disabled: page < 2,
  });

  const nextButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      toFindUser.id,
      page === 0 ? 2 : page + 1,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:next'),
    disabled: transactions.length < 10,
  });

  const embed = createEmbed({
    title: ctx.prettyResponse('wink', 'commands:transactions.title', {
      user: getDisplayName(toFindUser),
      page,
    }),
    color: hexStringToNumber(embedColor),
    description: parsedData.join('\n'),
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([backButton, nextButton])] });
  finishCommand();
};

const TransactionsCommand = createCommand({
  path: '',
  name: 'transações',
  nameLocalizations: { 'en-US': 'transactions' },
  description: '「💸」・Mostra as transações de alguém',
  descriptionLocalizations: { 'en-US': "「💸」・Shows someone's transactions" },
  category: 'info',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário centro das transações',
      descriptionLocalizations: { 'en-US': 'User center of the transactions' },
      required: false,
    },
    {
      name: 'página',
      nameLocalizations: {
        'en-US': 'page',
      },
      type: ApplicationCommandOptionTypes.Integer,
      minValue: 1,
      description: 'Página das transações',
      descriptionLocalizations: { 'en-US': 'Transactions page' },
      required: false,
    },
  ],
  authorDataFields: [],
  commandRelatedExecutions: [executeButtonClick],
  execute: async (ctx, finishCommand) => {
    const toFindUser = ctx.getOption<User>('user', 'users') ?? ctx.author;
    const page = ctx.getOption<number>('página', false) ?? 1;

    if (toFindUser.id === bot.id && ctx.author.id !== bot.ownerId)
      return finishCommand(
        ctx.makeMessage({
          content: `||${ctx.prettyResponse(
            'wink',
            'commands:transactions.not-of-your-business',
          )}||`,
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const userExists = await userRepository.findUser(toFindUser.id);

    if (!userExists)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:transactions.not-found', {
            user: getDisplayName(toFindUser),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    await ctx.defer();

    executeTransactionsCommand(ctx, toFindUser, page, userExists.selectedColor, finishCommand);
  },
});

export default TransactionsCommand;
