import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
  StringSelectComponent,
  SelectOption,
} from '@discordeno/bot';
import { createCommand } from '../../structures/command/createCommand.js';
import userRepository from '../../database/repositories/userRepository.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { MessageFlags } from '@discordeno/bot';
import { getUserTransactions } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { transactionableCommandOption } from '../../structures/constants.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { ApiTransactionReason, TransactionRegister } from '../../types/api.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { User } from '../../types/discordeno.js';

const TRANSACTION_REASONS = Object.freeze(
  Object.values(ApiTransactionReason).filter((f) => f !== ApiTransactionReason.SIMON_SAYS),
) as ApiTransactionReason[];

const getDefault = <T>(p: T[], c: SelectOption): T[] => {
  if (!c.default) return p;
  p.push(c.value as T);
  return p;
};

const resolveUser = (
  map: Map<string, Promise<User | null>>,
  c: TransactionRegister,
  actor: 'authorId' | 'targetId',
): void => {
  if (!map.has(c[actor])) map.set(c[actor], cacheRepository.getDiscordUser(c[actor], false));
};

const getSentOptions = (ctx: ComponentInteractionContext, index: number): SelectOption[] =>
  (ctx.interaction.message?.components?.[index]?.components?.[0] as StringSelectComponent).options;

const getTransactionComponents = (
  ctx: InteractionContext,
  page: number,
  firstUserId: string,
  secondUserId: string | false,
  embedColor: string,
  disableNext: boolean,
  disableSearch: boolean,
  disableBack: boolean,
  selectedTypes: string[] = [],
  selectedCurrencies: string[] = [],
): ActionRow[] => {
  const backButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'SEARCH',
      page === 0 ? 1 : page - 1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:back'),
    disabled: disableBack || page < 2,
  });

  const searchButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'SEARCH',
      1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
      '.',
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:search'),
    disabled: disableSearch,
  });

  const nextButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'SEARCH',
      page === 0 ? 2 : page + 1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:next'),
    disabled: disableNext || page > 99,
  });

  const typeSelection = createSelectMenu({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'U',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
      'T',
    ),
    placeholder: ctx.locale('commands:transactions.select-type'),
    options: TRANSACTION_REASONS.map((t) => ({
      label: ctx.locale(`commands:transactions.reasons.${t}_title`),
      value: t,
      default: selectedTypes.includes(t),
    })),
    minValues: 0,
    maxValues: TRANSACTION_REASONS.length,
  });

  const currencySelection = createSelectMenu({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'U',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
      'C',
    ),
    placeholder: ctx.locale('commands:transactions.select-currency'),
    options: transactionableCommandOption.map(
      (t: { name: string; value: string; nameLocalizations: Record<string, string> }) => ({
        label: t.nameLocalizations[ctx.guildLocale as 'en-US'] ?? t.name,
        value: t.value,
        default: selectedCurrencies.includes(t.value),
      }),
    ),
    minValues: 0,
    maxValues: transactionableCommandOption.length,
  });

  const userSelection = createUsersSelectMenu({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'US',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    placeholder: ctx.locale('commands:transactions.select-user'),
    minValues: 0,
    maxValues: 1,
    defaultValues: secondUserId && secondUserId !== 'N' ? [{ type: 'user', id: secondUserId }] : [],
  });

  return [
    createActionRow([typeSelection]),
    createActionRow([currencySelection]),
    createActionRow([userSelection]),
    createActionRow([backButton, searchButton, nextButton]),
  ];
};

const executeButtonClick = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, page, firstUserId, secondUserId, embedColor, updateAction] = ctx.sentData;

  const disableNext =
    (ctx.interaction.message?.components?.[3]?.components?.[2] as ButtonComponent).disabled ??
    false;

  const disablePagination =
    (ctx.interaction.message?.components?.[3]?.components?.[1] as ButtonComponent).disabled ??
    false;

  if (action === 'U') {
    let components: ActionRow[] = [];

    if (updateAction === 'T') {
      components = getTransactionComponents(
        ctx,
        Number(page),
        firstUserId,
        secondUserId,
        embedColor,
        disableNext,
        false,
        disablePagination,
        ctx.interaction.data.values,
        getSentOptions(ctx, 1).reduce<string[]>(getDefault, []),
      );
    }

    if (updateAction === 'C') {
      components = getTransactionComponents(
        ctx,
        Number(page),
        firstUserId,
        secondUserId,
        embedColor,
        disableNext,
        false,
        disablePagination,
        getSentOptions(ctx, 0).reduce<string[]>(getDefault, []),
        ctx.interaction.data.values,
      );
    }

    return ctx.makeMessage({ components });
  }

  if (action === 'US') {
    const userSent = ctx.interaction.data.resolved?.users?.array();

    let userId = 'N';

    if (typeof userSent !== 'undefined' && typeof userSent[0] !== 'undefined') {
      cacheRepository.setDiscordUser(bot.transformers.reverse.user(bot, userSent[0]));
      userId = `${userSent[0].id}`;
    }

    const components = getTransactionComponents(
      ctx,
      Number(page),
      firstUserId,
      userId,
      embedColor,
      disableNext,
      false,
      disablePagination,
      getSentOptions(ctx, 0).reduce<string[]>(getDefault, []),
      getSentOptions(ctx, 1).reduce<string[]>(getDefault, []),
    );

    return ctx.makeMessage({ components });
  }

  const firstUser = await cacheRepository.getDiscordUser(firstUserId, true);

  await ctx.ack();

  executeTransactionsCommand(ctx, firstUser ?? ctx.user, Number(page), embedColor, false);
};

const executeTransactionsCommand = async <FirstTime extends boolean>(
  ctx: FirstTime extends true ? ChatInputInteractionContext : ComponentInteractionContext,
  toFindUser: User,
  page: number,
  embedColor: string,
  firstTime: FirstTime,
): Promise<void> => {
  let types = TRANSACTION_REASONS;
  let currency = transactionableCommandOption.map((a) => a.value);
  let users = [`${toFindUser.id}`];

  if (!firstTime) {
    const sentTypes = getSentOptions(ctx as ComponentInteractionContext, 0).reduce<
      ApiTransactionReason[]
    >(getDefault, []);

    const sentCurrency = getSentOptions(ctx as ComponentInteractionContext, 1).reduce<
      typeof currency
    >(getDefault, []);

    const sentUserId = (ctx as ComponentInteractionContext).sentData[3];

    if (sentTypes.length > 0) types = sentTypes;

    if (sentCurrency.length > 0) currency = sentCurrency;

    users = [`${toFindUser.id}`, `${sentUserId}`];
  }

  const transactions = await getUserTransactions(users, page, types, currency);

  if (!transactions || transactions.length === 0) {
    if (firstTime)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:transactions.no-transactions', {
          user: getDisplayName(toFindUser),
        }),
        embeds: [],
      });

    const components = getTransactionComponents(
      ctx as ComponentInteractionContext,
      page,
      users[0],
      users[1] ?? 'N',
      embedColor,
      true,
      true,
      true,
      types.length === TRANSACTION_REASONS.length && !firstTime ? [] : (types as string[]),
      currency.length === transactionableCommandOption.length && !firstTime ? [] : currency,
    );

    return ctx.makeMessage({
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:transactions.no-transactions', {
        user: getDisplayName(toFindUser),
      }),
      components,
    });
  }

  const toResolve = transactions.reduce<Map<string, Promise<User | null>>>((map, c) => {
    resolveUser(map, c, 'authorId');
    resolveUser(map, c, 'targetId');
    return map;
  }, new Map<string, Promise<User | null>>());

  const resolvedUsers = await Promise.all(toResolve.values());

  const parsedData = transactions.map((a) => {
    const author = `${resolvedUsers.find((b) => `${b?.id}` === a.authorId)?.username ?? '??'} - (${
      a.authorId
    })`;
    const target = `${resolvedUsers.find((b) => `${b?.id}` === a.targetId)?.username ?? '??'} - (${
      a.targetId
    })`;

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
      emoji: ctx.safeEmoji(a.currencyType),
      amount: a.amount,
      currencyType: ctx.locale(`common:${a.currencyType}`),
      reason: ctx.locale(`commands:transactions.reasons.${a.reason}`),
    })}`;
  });

  const embed = createEmbed({
    title: ctx.prettyResponse('wink', 'commands:transactions.title', {
      user: getDisplayName(toFindUser),
      page,
    }),
    color: hexStringToNumber(embedColor),
    description: parsedData.join('\n'),
  });

  const components = getTransactionComponents(
    ctx,
    page,
    users[0],
    users[1] ?? 'N',
    embedColor,
    transactions.length < 10,
    true,
    false,
    firstTime
      ? []
      : getSentOptions(ctx as ComponentInteractionContext, 0).reduce<string[]>(getDefault, []),
    firstTime
      ? []
      : getSentOptions(ctx as ComponentInteractionContext, 1).reduce<string[]>(getDefault, []),
  );

  ctx.makeMessage({ embeds: [embed], components, content: '' });
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
          flags: MessageFlags.Ephemeral,
        }),
      );

    const userExists = await userRepository.findUser(toFindUser.id);

    if (!userExists)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:transactions.not-found', {
            user: getDisplayName(toFindUser),
          }),
          flags: MessageFlags.Ephemeral,
        }),
      );

    if (userExists.ban && ctx.author.id !== bot.ownerId)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:transactions.banned-user', {
            user: getDisplayName(toFindUser),
          }),
          flags: MessageFlags.Ephemeral,
        }),
      );

    await ctx.defer();

    finishCommand();

    executeTransactionsCommand(ctx, toFindUser, page, userExists.selectedColor, true);
  },
});

export default TransactionsCommand;
