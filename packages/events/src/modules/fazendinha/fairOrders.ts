import { ButtonStyles, MessageFlags, User } from '@discordeno/bot';
import { InteractionContext } from '../../types/menhera.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import {
  createActionRow,
  createAsyncCustomId,
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import fairOrderRepository from '../../database/repositories/fairOrderRepository.js';
import {
  Items,
  MAX_FAIR_ORDERS_PER_PAGE,
  MAX_TRADE_REQUESTS_IN_FAIR_PER_USER,
  Plants,
} from './constants.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import {
  addItems,
  addPlants,
  checkNeededPlants,
  getQualityEmoji,
  getSiloLimits,
  removePlants,
} from './siloUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import {
  handleAddAwardButton,
  handlePlaceOrder,
  handleReceiveModal,
  handleTradeRequestModal,
} from './createFairOrder.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { ModalInteraction } from '../../types/interaction.js';
import { AvailableItems } from './types.js';
import userRepository from '../../database/repositories/userRepository.js';

const deleteOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  orderId: string,
) => {
  const order = await fairOrderRepository.getOrder(orderId);

  if (!order) return displayFairOrders(ctx, farmer, embedColor);

  await fairOrderRepository.deleteOrder(orderId);

  const starsAward = order.awards.estrelinhas;

  if (starsAward) {
    await starsRepository.addStars(ctx.user.id, starsAward);
    await postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      Number(starsAward),
      'estrelinhas',
      ApiTransactionReason.FAIR,
    );
  }

  await displayFairOrders(ctx, farmer, embedColor);

  return ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('success', `commands:fazendinha.feira.order.order-deleted`),
      ),
    ],
  });
};

const handleClaimOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  orderId: string,
) => {
  const order = await fairOrderRepository.getOrder(orderId);

  if (!order)
    return ctx.respondInteraction({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(
          ctx.prettyResponse('error', 'commands:fazendinha.feira.order.order-gone'),
        ),
      ],
    });

  const limits = getSiloLimits(farmer);

  if (limits.used + order.weight > limits.limit)
    return ctx.respondInteraction({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:fazendinha.feira.order.silo-full')),
      ],
    });

  farmer.silo = addPlants(farmer.silo, [
    { plant: order.plant, weight: order.weight, quality: order.quality },
  ]);

  await farmerRepository.updateFarmer(farmer.id, farmer.silo, farmer.items);

  await fairOrderRepository.deleteOrder(order._id);

  await displayFairOrders(ctx, await farmerRepository.getFarmer(ctx.user.id), embedColor);
};

const handleTakeOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  orderId: string,
) => {
  const order = await fairOrderRepository.getOrder(orderId);

  if (!order)
    return ctx.respondInteraction({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(
          ctx.prettyResponse('error', 'commands:fazendinha.feira.order.order-gone'),
        ),
      ],
    });

  const canTakeOrder = checkNeededPlants(
    [{ plant: order.plant, weight: order.weight, quality: order.quality }],
    farmer.silo,
  );

  if (!canTakeOrder)
    return ctx.respondInteraction({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:fazendinha.feira.order.no-items')),
      ],
    });

  const itemsAmount = order.awards.fertilizers ?? 0;

  if (itemsAmount > 0) {
    const limits = getSiloLimits(farmer);

    if (limits.used + itemsAmount > limits.limit)
      return ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.feira.order.silo-full'),
          ),
        ],
      });
  }

  if (order.awards.estrelinhas) {
    await starsRepository.addStars(ctx.user.id, order.awards.estrelinhas);
    await postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      Number(order.awards.estrelinhas),
      'estrelinhas',
      ApiTransactionReason.FAIR,
    );
  }

  if (order.awards.fertilizers)
    farmer.items = addItems(farmer.items, [
      { amount: order.awards.fertilizers, id: AvailableItems.Fertilizer },
    ]);

  farmer.silo = removePlants(farmer.silo, [
    { plant: order.plant, weight: order.weight, quality: order.quality },
  ]);

  await farmerRepository.updateFarmer(farmer.id, farmer.silo, farmer.items);

  await fairOrderRepository.completeOrder(order._id);
  await notificationRepository.createNotification(
    order.userId,
    'commands:notificações.notifications.user-accepted-deal',
    {
      username: getDisplayName(ctx.user),
      name: ctx.locale('commands:fazendinha.feira.order.order-name', {
        plantEmoji: Plants[order.plant].emoji,
        weight: order.weight,
        qualityEmoji: getQualityEmoji(order.quality),
        plantName: ctx.locale(`data:plants.${order.plant}`),
      }),
    },
  );

  await displayFairOrders(ctx, await farmerRepository.getFarmer(ctx.user.id), embedColor);

  await ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('success', 'commands:fazendinha.feira.order.order-accepted'),
      ),
    ],
  });
};

const handleFairOrderButton = async (ctx: ComponentInteractionContext) => {
  const [action, embedColor, orderId] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (action === 'PUBLIC') return displayFairOrders(ctx, farmer, embedColor);
  if (action === 'DELETE') return deleteOrder(ctx, farmer, embedColor, orderId);
  if (action === 'AGREED') return handleTakeOrder(ctx, farmer, embedColor, orderId);
  if (action === 'ASK_DELETE') return displayFairOrders(ctx, farmer, embedColor, { orderId });
  if (action === 'CLAIM') return handleClaimOrder(ctx, farmer, embedColor, orderId);
  if (action === 'REQUEST') return handleTradeRequestModal(ctx, embedColor);
  if (action === 'EDIT_AWARD') return handleAddAwardButton(ctx, farmer, embedColor);
  if (action === 'PLACE_ORDER') return handlePlaceOrder(ctx, farmer, embedColor);
  if (action === 'PAGE')
    return displayFairOrders(ctx, farmer, embedColor, { page: Number(orderId) });
  if (action === 'MODAL')
    return handleReceiveModal(
      ctx as ComponentInteractionContext<ModalInteraction>,
      farmer,
      embedColor,
    );
};

interface FairOrderParameters {
  user?: User;
  page?: number;
  orderId?: string;
}

const displayFairOrders = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  { page = 0, user, orderId }: FairOrderParameters = {},
) => {
  const userData = await userRepository.ensureFindUser(farmer.id);
  const canCreateRequest =
    userData.estrelinhas > 0 ||
    farmer.items.some((a) => a.id === AvailableItems.Fertilizer && a.amount > 0);

  const titleDisplay = createTextDisplay(
    `# ${ctx.locale(`commands:fazendinha.feira.order.${user ? 'user-orders' : 'public-orders'}`, {
      user: getDisplayName(user ?? ctx.user),
    })}`,
  );

  const createOrder = createButton({
    label: ctx.locale('commands:fazendinha.feira.order.create-order'),
    customId: createCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'REQUEST',
      embedColor,
      '{}',
    ),
    disabled: !canCreateRequest,
    style: ButtonStyles.Success,
  });

  const viewPublic = createButton({
    customId: createCustomId(9, ctx.user.id, ctx.originalInteractionId, 'PUBLIC', embedColor),
    style: ButtonStyles.Secondary,
    label: ctx.locale('commands:fazendinha.feira.order.view-public-orders'),
  });

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        accessory: user ? viewPublic : createOrder,
        components: [titleDisplay],
      }),
      createSeparator(),
    ],
  });

  const totalOrders = user
    ? MAX_TRADE_REQUESTS_IN_FAIR_PER_USER
    : await fairOrderRepository.countPublicOrders();

  const totalPages = Math.floor(totalOrders / MAX_FAIR_ORDERS_PER_PAGE) + 1;

  const toSearchPage = page >= totalPages ? 0 : page;

  const orders = user
    ? await fairOrderRepository.getUserOrders(farmer.id)
    : await fairOrderRepository.listPublicOrders(
        farmer.id,
        MAX_FAIR_ORDERS_PER_PAGE * toSearchPage,
        MAX_FAIR_ORDERS_PER_PAGE,
      );

  const needPagination = totalOrders > MAX_FAIR_ORDERS_PER_PAGE;

  if (orders.length === 0)
    container.components.push(
      createTextDisplay(
        ctx.locale(`commands:fazendinha.feira.order.no-${user ? 'user' : 'public'}-orders`),
      ),
    );
  else
    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (res) => {
      let finished = 0;

      const mappedUsers = new Set(orders.map((a) => a.userId));

      const foundUsers = await Promise.all(
        [...mappedUsers].map((a) => cacheRepository.getDiscordUser(a, false)),
      );

      const tabledUsers = foundUsers.reduce<Record<string, string>>((p, c) => {
        if (!c) return p;

        p[`${c.id}`] = getDisplayName(c);

        return p;
      }, {});

      orders.forEach(async (order) => {
        const userIsOwner = order.userId === `${ctx.user.id}`;
        const confirmDelete = orderId === order._id;
        const completed = order.completed;

        const canClick =
          userIsOwner ||
          checkNeededPlants(
            [{ plant: order.plant, weight: order.weight, quality: order.quality }],
            farmer.silo,
          );

        container.components.push(
          createSection({
            accessory: createButton({
              customId: await createAsyncCustomId(
                9,
                ctx.user.id,
                ctx.originalInteractionId,
                userIsOwner
                  ? completed
                    ? 'CLAIM'
                    : confirmDelete
                      ? 'DELETE'
                      : 'ASK_DELETE'
                  : 'AGREED',
                embedColor,
                order._id,
              ),
              disabled: !canClick,
              style: userIsOwner
                ? completed
                  ? ButtonStyles.Success
                  : ButtonStyles.Danger
                : ButtonStyles.Primary,
              label: ctx.locale(
                confirmDelete
                  ? 'common:confirm'
                  : `commands:fazendinha.feira.order.${
                      userIsOwner ? (completed ? 'claim-order' : 'delete-order') : 'complete-order'
                    }`,
              ),
            }),
            components: [
              createTextDisplay(
                `### ${ctx.locale('commands:fazendinha.feira.order.order-name', {
                  plantEmoji: Plants[order.plant].emoji,
                  weight: order.weight,
                  plantName: ctx.locale(`data:plants.${order.plant}`),
                  qualityEmoji: getQualityEmoji(order.quality),
                })}\n${completed ? '~~' : ''}${ctx.locale(
                  'commands:fazendinha.feira.order.order-description',
                  {
                    user: tabledUsers[order.userId] ?? order.userId,
                    awards: `- ${Object.entries(order.awards)
                      .map(([type, amount]) =>
                        ctx.locale('commands:fazendinha.feira.order.order-award', {
                          amount: amount,
                          metric: type === 'estrelinhas' ? '' : 'x',
                          emoji:
                            type === 'estrelinhas'
                              ? ctx.safeEmoji(type)
                              : Items[AvailableItems.Fertilizer].emoji,
                        }),
                      )
                      .join(`\n- `)}`,
                  },
                )}${completed ? '~~' : ''}${confirmDelete ? `\n-# ${ctx.locale('commands:fazendinha.feira.order.confirm-delete')}` : ''}`,
              ),
            ],
          }),
          createSeparator(),
        );

        finished += 1;
        if (finished >= orders.length) res(finished);
      });
    });

  if (needPagination)
    container.components.push(
      createActionRow([
        createButton({
          label: ctx.locale('common:back'),
          customId: createCustomId(
            9,
            ctx.user.id,
            ctx.originalInteractionId,
            'PAGE',
            embedColor,
            toSearchPage - 1,
          ),
          disabled: toSearchPage <= 0,
          style: toSearchPage <= 0 ? ButtonStyles.Secondary : ButtonStyles.Primary,
        }),
        createButton({
          label: ctx.locale('common:next'),
          customId: createCustomId(
            9,
            ctx.user.id,
            ctx.originalInteractionId,
            'PAGE',
            embedColor,
            toSearchPage + 1,
          ),
          disabled: toSearchPage >= totalPages - 1,
          style: toSearchPage >= totalPages - 1 ? ButtonStyles.Secondary : ButtonStyles.Primary,
        }),
      ]),
      createTextDisplay(
        `-# ${ctx.locale('commands:fazendinha.feira.order.pagination', { page: toSearchPage + 1, totalPages })}`,
      ),
    );

  ctx.makeLayoutMessage({ components: [container] });
};

export { displayFairOrders, handleFairOrderButton };
