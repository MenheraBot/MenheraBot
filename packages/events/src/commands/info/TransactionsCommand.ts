/* eslint-disable no-nested-ternary */
import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
  SelectMenuComponent,
} from 'discordeno/types';
import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import userRepository from '../../database/repositories/userRepository';
import { getDisplayName } from '../../utils/discord/userUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getUserTransactions } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { millisToSeconds } from '../../utils/miscUtils';
import cacheRepository from '../../database/repositories/cacheRepository';
import { EMOJIS, transactionableCommandOption } from '../../structures/constants';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ApiTransactionReason } from '../../types/api';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { InteractionContext } from '../../types/menhera';
import { logger } from '../../utils/logger';

const TRANSACTION_REASONS = Object.freeze(Object.values(ApiTransactionReason));

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
      ctx.commandId,
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
      ctx.commandId,
      'SEARCH',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:search'),
    disabled: disableSearch,
  });

  const nextButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
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
      ctx.commandId,
      'U',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
      'T',
    ),
    options: TRANSACTION_REASONS.map((t) => ({
      label: t,
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
      ctx.commandId,
      'U',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
      'C',
    ),
    options: transactionableCommandOption.map((t) => ({
      label: t.name,
      value: t.value,
      default: selectedCurrencies.includes(t.value),
    })),
    minValues: 0,
    maxValues: transactionableCommandOption.length,
  });

  const userSelection = createUsersSelectMenu({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      'US',
      page,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
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
        (
          ctx.interaction.message?.components?.[1].components?.[0] as SelectMenuComponent
        ).options.reduce<string[]>((p, c) => {
          if (!c.default) return p;
          p.push(c.value);
          return p;
        }, []),
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
        (
          ctx.interaction.message?.components?.[0].components?.[0] as SelectMenuComponent
        ).options.reduce<string[]>((p, c) => {
          if (!c.default) return p;
          p.push(c.value);
          return p;
        }, []),
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
      (
        ctx.interaction.message?.components?.[0].components?.[0] as SelectMenuComponent
      ).options.reduce<string[]>((p, c) => {
        if (!c.default) return p;
        p.push(c.value);
        return p;
      }, []),
      (
        ctx.interaction.message?.components?.[1].components?.[0] as SelectMenuComponent
      ).options.reduce<string[]>((p, c) => {
        if (!c.default) return p;
        p.push(c.value);
        return p;
      }, []),
    );

    return ctx.makeMessage({ components });
  }

  const firstUser = await cacheRepository.getDiscordUser(firstUserId, true);

  const noop = () => undefined;

  await ctx.ack();

  executeTransactionsCommand(ctx, firstUser ?? ctx.user, Number(page), embedColor, noop, false);
};

const executeTransactionsCommand = async <FirstTime extends boolean>(
  ctx: FirstTime extends true ? ChatInputInteractionContext : ComponentInteractionContext,
  toFindUser: User,
  page: number,
  embedColor: string,
  finishCommand: (args?: unknown) => void,
  firstTime: FirstTime,
): Promise<void> => {
  let types = TRANSACTION_REASONS;
  let currency = transactionableCommandOption.map((a) => a.value);
  let users = [`${toFindUser.id}`];

  if (!firstTime) {
    const sentTypes = (
      ctx.interaction.message?.components?.[0]?.components?.[0] as SelectMenuComponent
    ).options.filter((a) => a.default);

    const sentCurrency = (
      ctx.interaction.message?.components?.[1].components?.[0] as SelectMenuComponent
    ).options.filter((a) => a.default);

    logger.debug('sentTypes', sentTypes);
    logger.debug('sentCurrency', sentCurrency);

    const sentUserId = (ctx as ComponentInteractionContext).sentData[3];

    if (sentTypes.length > 0)
      types = sentTypes.reduce<ApiTransactionReason[]>((p, c) => {
        if (!c.default) return p;
        p.push(c.value as ApiTransactionReason);
        return p;
      }, []);

    if (sentCurrency.length > 0)
      currency = sentCurrency.reduce<typeof currency>((p, c) => {
        if (!c.default) return p;
        p.push(c.value as 'estrelinhas');
        return p;
      }, []);

    users = [`${toFindUser.id}`, `${sentUserId}`];
  }
  logger.debug('First time', firstTime);
  logger.debug('types', types.length);
  logger.debug('currency', currency.length);
  logger.debug('users', users);

  const transactions = await getUserTransactions(users, page, types, currency);

  if (!transactions || transactions.length === 0) {
    if (firstTime)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:transactions.no-transactions', {
            user: getDisplayName(toFindUser),
          }),
        }),
      );

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

    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:transactions.no-transactions', {
          user: getDisplayName(toFindUser),
        }),
        components,
        embeds: [],
      }),
    );
  }

  const toResolve = transactions.reduce<Map<string, Promise<User | null>>>((map, c) => {
    if (!map.has(c.authorId))
      map.set(c.authorId, cacheRepository.getDiscordUser(c.authorId, false));

    if (!map.has(c.targetId))
      map.set(c.targetId, cacheRepository.getDiscordUser(c.targetId, false));

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
      emoji: EMOJIS[a.currencyType],
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

  logger.debug(
    'selectedTypes',
    (
      ctx.interaction.message?.components?.[0].components?.[0] as SelectMenuComponent
    )?.options?.reduce<string[]>((p, c) => {
      if (!c.default) return p;
      p.push(c.value);
      return p;
    }, []),
    'selectedCurrencies',
    (
      ctx.interaction.message?.components?.[1].components?.[0] as SelectMenuComponent
    )?.options?.reduce<string[]>((p, c) => {
      if (!c.default) return p;
      p.push(c.value);
      return p;
    }, []),
  );

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
      : (
          ctx.interaction.message?.components?.[0].components?.[0] as SelectMenuComponent
        ).options.reduce<string[]>((p, c) => {
          if (!c.default) return p;
          p.push(c.value);
          return p;
        }, []),
    firstTime
      ? []
      : (
          ctx.interaction.message?.components?.[1].components?.[0] as SelectMenuComponent
        ).options.reduce<string[]>((p, c) => {
          if (!c.default) return p;
          p.push(c.value);
          return p;
        }, []),
  );

  ctx.makeMessage({ embeds: [embed], components });
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

    if (userExists.ban && ctx.author.id !== bot.ownerId)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:transactions.banned-user', {
            user: getDisplayName(toFindUser),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    await ctx.defer();

    executeTransactionsCommand(
      ctx,
      toFindUser,
      page,
      userExists.selectedColor,
      finishCommand,
      true,
    );
  },
});

export default TransactionsCommand;
