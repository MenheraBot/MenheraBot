import {
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
  StringSelectComponent,
  SelectOption,
  UserSelectComponent,
  ContainerComponent,
} from '@discordeno/bot';
import { createCommand } from '../../structures/command/createCommand.js';
import userRepository from '../../database/repositories/userRepository.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { MessageFlags } from '@discordeno/bot';
import { getUserTransactions } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { transactionableCommandOption, TRANSACTIONS_PER_PAGE } from '../../structures/constants.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  ApiTransactionReason,
  FilterTransactionCurrency,
  TransactionRegister,
} from '../../types/api.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { User } from '../../types/discordeno.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import { Plants } from '../../modules/fazendinha/constants.js';
import { AvailablePlants } from '../../modules/fazendinha/types.js';
import { extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils.js';
import { getQualityEmoji } from '../../modules/fazendinha/siloUtils.js';

const TRANSACTION_FILTERS_REPLACEMENT = {
  [ApiTransactionReason.BLACKJACK_LOST_DATA]: ApiTransactionReason.BLACKJACK_COMMAND,
  [ApiTransactionReason.WIN_BICHO]: ApiTransactionReason.BICHO_COMMAND,
  [ApiTransactionReason.BUY_IMAGE_ROYALTY]: ApiTransactionReason.BUY_THEME_ROYALTY,
};

const TRANSACTION_REASONS = Object.values(ApiTransactionReason).filter(
  (f) => f !== ApiTransactionReason.SIMON_SAYS && !(f in TRANSACTION_FILTERS_REPLACEMENT),
);

const createAppendedTransactionReasons = (
  types: ApiTransactionReason[],
): ApiTransactionReason[] => {
  const cloned = JSON.parse(JSON.stringify(types)) as ApiTransactionReason[];

  const inverted = Object.entries(TRANSACTION_FILTERS_REPLACEMENT).reduce<
    Record<ApiTransactionReason, ApiTransactionReason>
  >(
    (p, [k, v]) => {
      p[v] = k as ApiTransactionReason;

      return p;
    },
    {} as Record<ApiTransactionReason, ApiTransactionReason>,
  );

  for (let i = cloned.length; i >= 0; i--)
    if (inverted[cloned[i]]) cloned.push(inverted[cloned[i]]);

  return cloned;
};

const getCurrencies = (
  ctx: InteractionContext,
  selectedCurrencies: FilterTransactionCurrency[],
) => [
  {
    label: ctx.locale('commands:fazendinha.plantations.silo'),
    value: 'plant' as const,
    emoji: extractNameAndIdFromEmoji(Plants[AvailablePlants.Mate].emoji),
    default: selectedCurrencies.includes('plant'),
  },
  ...transactionableCommandOption.map((t) => ({
    label: (t.nameLocalizations[ctx.interactionLocale as 'en-US'] ?? t.name).split('|')[1].trim(),
    value: t.value,
    default: selectedCurrencies.includes(t.value),
    emoji: extractNameAndIdFromEmoji(t.name.split('|')[0].trim()),
  })),
];

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

const getTransactionComponents = (
  ctx: InteractionContext,
  page: number,
  firstUserId: string,
  secondUserId: string | false,
  embedColor: string,
  hasMoreItems: boolean,
  user: User,
  transactionsText: string,
  selectedTypes: string[],
  selectedCurrencies: FilterTransactionCurrency[],
): [ContainerComponent, ContainerComponent] => {
  const backButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'BACK',
      page - 1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:back'),
    disabled: page < 2,
  });

  const nextButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'NEXT',
      page + 1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:next'),
    disabled: !hasMoreItems || page > 99,
  });

  const typeSelection = createSelectMenu({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'TYPE',
      1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
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
      'CURRENCY',
      1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    placeholder: ctx.locale('commands:transactions.select-currency'),
    options: getCurrencies(ctx, selectedCurrencies),
    minValues: 0,
    maxValues: transactionableCommandOption.length + 1,
  });

  const userSelection = createUsersSelectMenu({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'USER',
      1,
      firstUserId,
      secondUserId || 'N',
      embedColor,
    ),
    placeholder: ctx.locale('commands:transactions.select-user'),
    minValues: 0,
    maxValues: 1,
    defaultValues: secondUserId && secondUserId !== 'N' ? [{ type: 'user', id: secondUserId }] : [],
  });

  const dataContainer = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createTextDisplay(
        `## ${ctx.prettyResponse('wink', 'commands:transactions.title', {
          user: getDisplayName(user),
          page,
        })}`,
      ),
      createSeparator(),
      createTextDisplay(transactionsText),
    ],
  });

  if (page > 1 || hasMoreItems)
    dataContainer.components.push(createSeparator(), createActionRow([backButton, nextButton]));

  const filterContainer = createContainer({
    components: [
      createTextDisplay(`## ${ctx.locale('commands:transactions.filters')}`),
      createSeparator(),
      createActionRow([typeSelection]),
      createActionRow([currencySelection]),
      createActionRow([userSelection]),
      createTextDisplay(ctx.locale('commands:transactions.user-filter')),
    ],
  });

  return [dataContainer, filterContainer];
};

const getByIncludesCustomId = <
  T extends ButtonComponent | StringSelectComponent | UserSelectComponent,
>(
  components: NonNullable<ComponentInteractionContext['interaction']['message']>['components'],
  searchString: string,
): T | undefined => {
  for (const component of components) {
    if (component.customId && component.customId.includes(searchString)) return component as T;

    if (component.components) {
      const foundCustomId = getByIncludesCustomId(component.components, searchString);
      if (foundCustomId) return foundCustomId as T;
    }
  }
};

const disableAllComponents = (
  components: NonNullable<ComponentInteractionContext['interaction']['message']>['components'],
) => {
  for (const component of components) {
    component.disabled = true;

    if ('components' in component) disableAllComponents(component.components ?? []);
  }
};

const executeButtonClick = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, page, firstUserId, secondUserId, embedColor] = ctx.sentData;

  const sentComponents = ctx.interaction.message?.components ?? [];

  let toUseSecondUserId = secondUserId;

  if (action === 'USER') {
    const userSent = ctx.interaction.data.resolved?.users?.array();

    if (typeof userSent !== 'undefined' && typeof userSent[0] !== 'undefined') {
      cacheRepository.setDiscordUser(bot.transformers.reverse.user(bot, userSent[0]));
      toUseSecondUserId = `${userSent[0].id}`;
      if (toUseSecondUserId === firstUserId) toUseSecondUserId = 'N';
    } else {
      toUseSecondUserId = 'N';
    }
  }

  if (action === 'TYPE' || action === 'CURRENCY') {
    const component = getByIncludesCustomId(sentComponents, action) as StringSelectComponent;

    component.options = component.options.map((v) => ({
      ...v,
      default: (ctx.interaction as SelectMenuInteraction).data.values.includes(v.value),
    }));
  }

  const firstUser = await cacheRepository.getDiscordUser(firstUserId, true);

  disableAllComponents(sentComponents);

  await ctx.makeLayoutMessage({ components: sentComponents as unknown as ContainerComponent[] });

  return executeTransactionsCommand(
    ctx,
    firstUser ?? ctx.user,
    Number(page),
    embedColor,
    false,
    toUseSecondUserId,
  );
};

const executeTransactionsCommand = async <FirstTime extends boolean>(
  ctx: FirstTime extends true ? ChatInputInteractionContext : ComponentInteractionContext,
  toFindUser: User,
  page: number,
  embedColor: string,
  firstTime: FirstTime,
  secondUserId: string,
): Promise<void> => {
  let types = TRANSACTION_REASONS;
  const users = [`${toFindUser.id}`, secondUserId];

  const sentComponents = ctx?.interaction?.message?.components ?? [];

  const sentTypes =
    (getByIncludesCustomId(sentComponents, 'TYPE') as StringSelectComponent)?.options?.reduce?.(
      getDefault,
      [],
    ) ?? [];

  const sentCurrency =
    (getByIncludesCustomId(sentComponents, 'CURRENCY') as StringSelectComponent)?.options?.reduce?.(
      getDefault,
      [],
    ) ?? [];

  const allCurrencies = getCurrencies(ctx, sentCurrency).map(
    (a) => a.value,
  ) as FilterTransactionCurrency[];

  let currency = allCurrencies;

  if (sentTypes.length > 0) types = sentTypes;
  if (sentCurrency.length > 0) currency = sentCurrency;

  const transactions = await getUserTransactions(
    users,
    page,
    createAppendedTransactionReasons(types),
    currency,
  );

  if (!transactions)
    return ctx.makeLayoutMessage({
      components: [createTextDisplay(ctx.prettyResponse('error', 'commands:transactions.error'))],
    });

  if (transactions.length === 0 && firstTime)
    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(
          ctx.prettyResponse('error', 'commands:transactions.no-transactions', {
            user: getDisplayName(toFindUser),
          }),
        ),
      ],
    });

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

    const [, plant, quality] = a.currencyType.startsWith('plant') ? a.currencyType.split('-') : [];

    return `${ctx.locale('commands:transactions.transactions.base', {
      unix: millisToSeconds(a.date),
    })}${ctx.locale(`commands:transactions.transactions.${transactionType}`, {
      author,
      target,
      emoji: plant
        ? `${Plants[plant as '1'].emoji} ${getQualityEmoji(Number(quality))}`
        : ctx.safeEmoji(a.currencyType as 'gods'),
      amount: `${a.amount}${plant ? ' Kg' : ''}`,
      currencyType: plant
        ? ctx.locale(`data:plants.${plant as '1'}`)
        : ctx.locale(`common:${a.currencyType as 'gods'}`),
      reason: ctx.locale(`commands:transactions.reasons.${a.reason}`),
    })}`;
  });

  const components = getTransactionComponents(
    ctx as ComponentInteractionContext,
    page,
    users[0],
    users[1],
    embedColor,
    parsedData.length >= TRANSACTIONS_PER_PAGE,
    toFindUser,
    parsedData.join('\n') ||
      ctx.locale('commands:transactions.no-transactions', {
        user: getDisplayName(toFindUser),
      }),
    types.length === TRANSACTION_REASONS.length ? [] : types,
    currency.length === allCurrencies.length ? [] : currency,
  );

  ctx.makeLayoutMessage({ components });
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

    executeTransactionsCommand(ctx, toFindUser, page, userExists.selectedColor, true, 'N');
  },
});

export default TransactionsCommand;
