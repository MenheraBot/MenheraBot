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
import { MAX_FAIR_ORDERS_PER_PAGE, MAX_ORDER_IN_FAIR_PER_USER, Plants } from './constants.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import {
  addItems,
  addPlants,
  checkNeededPlants,
  getQualityEmoji,
  getSiloLimits,
} from './siloUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { getAwardEmoji } from '../../commands/info/DailyCommand.js';
import { handleAddAwardModal, handleReceiveModal, handleRequestModal } from './createFairOrder.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { ModalInteraction } from '../../types/interaction.js';

const deleteOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  orderId: string,
) => {
  const order = await fairOrderRepository.getOrder(orderId);

  if (!order) return displayFairOrders(ctx, farmer, embedColor);

  await fairOrderRepository.deleteOrder(orderId);

  const starsAward = order.awards.find((a) => a.type === 'estrelinhas');

  if (starsAward) {
    await starsRepository.addStars(ctx.user.id, starsAward.amount);
    await postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      Number(starsAward.amount),
      'estrelinhas',
      ApiTransactionReason.BUY_FAIR,
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

  const awardSiloStorage = order.awards.reduce(
    (p, c) => p + (c.type === 'estrelinhas' ? 0 : c.type === 'plant' ? c.weight : c.amount),
    0,
  );

  if (awardSiloStorage > 0) {
    const limits = getSiloLimits(farmer);

    if (limits.used + awardSiloStorage > limits.limit)
      return ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.feira.order.silo-full'),
          ),
        ],
      });
  }

  order.awards.forEach(async (award) => {
    switch (award.type) {
      case 'estrelinhas': {
        await starsRepository.addStars(ctx.user.id, award.amount);
        await postTransaction(
          `${bot.id}`,
          `${ctx.user.id}`,
          Number(award.amount),
          'estrelinhas',
          ApiTransactionReason.BUY_FAIR,
        );
        break;
      }
      case 'item': {
        farmer.items = addItems(farmer.items, [award]);
        break;
      }
      case 'plant': {
        farmer.silo = addPlants(farmer.silo, [
          { plant: award.id, weight: award.weight, quality: award.quality },
        ]);
        break;
      }
    }
  });

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
  if (action === 'REQUEST') return handleRequestModal(ctx, embedColor);
  if (action === 'ADD_AWARD') return handleAddAwardModal(ctx, farmer, embedColor);
  if (action === 'PAGE')
    return displayFairOrders(ctx, farmer, embedColor, { page: Number(orderId) });
  if (action === 'PLANT_MODAL')
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
    ? MAX_ORDER_IN_FAIR_PER_USER
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
                userIsOwner ? (confirmDelete ? 'DELETE' : 'ASK_DELETE') : 'AGREED',
                embedColor,
                order._id,
              ),
              disabled: !canClick,
              style: userIsOwner ? ButtonStyles.Danger : ButtonStyles.Primary,
              label: ctx.locale(
                confirmDelete
                  ? 'common:confirm'
                  : `commands:fazendinha.feira.order.${userIsOwner ? 'delete-order' : 'complete-order'}`,
              ),
            }),
            components: [
              createTextDisplay(
                `### ${ctx.locale('commands:fazendinha.feira.order.order-name', {
                  plantEmoji: Plants[order.plant].emoji,
                  weight: order.weight,
                  plantName: ctx.locale(`data:plants.${order.plant}`),
                  qualityEmoji: getQualityEmoji(order.quality),
                })}\n${ctx.locale('commands:fazendinha.feira.order.order-description', {
                  user: tabledUsers[order.userId] ?? order.userId,
                  awards: `- ${order.awards
                    .map((a) =>
                      ctx.locale('commands:fazendinha.feira.order.order-award', {
                        amount: a.type === 'plant' ? a.weight : a.amount,
                        metric: a.type === 'plant' ? ' Kg' : 'x',
                        emoji: `${getAwardEmoji(ctx, { type: a.type, helper: a.id })} ${a.type === 'plant' ? getQualityEmoji(a.quality) : ''}`,
                      }),
                    )
                    .join(`\n- `)}`,
                })}${confirmDelete ? `\n-# ${ctx.locale('commands:fazendinha.feira.order.confirm-delete')}` : ''}`,
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
