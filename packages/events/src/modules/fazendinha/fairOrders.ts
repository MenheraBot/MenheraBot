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
import { MAX_FAIR_ORDERS_PER_PAGE, Plants } from './constants.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { checkNeededPlants, getQualityEmoji } from './siloUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { getAwardEmoji } from '../../commands/info/DailyCommand.js';

const deleteOrder = async (
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

  await fairOrderRepository.deleteOrder(orderId);

  const starsAward = order.awards.find((a) => a.type === 'estrelinhas');

  if (starsAward) {
    await starsRepository.addStars(ctx.user.id, starsAward.amount);
    await postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      Number(starsAward.amount),
      'estrelinhas',
      ApiTransactionReason.PIX_COMMAND,
    );
  }

  await displayFairOrders(ctx, farmer, embedColor);

  return ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('error', `commands:fazendinha.feira.order.order-deleted`),
      ),
    ],
  });
};

const handleFairOrderButton = async (ctx: ComponentInteractionContext) => {
  const [action, embedColor, orderId] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (action === 'PUBLIC') return displayFairOrders(ctx, farmer, embedColor, 0);

  if (action === 'PAGE') return displayFairOrders(ctx, farmer, embedColor, Number(ctx.sentData[2]));

  if (action === 'DELETE') return deleteOrder(ctx, farmer, embedColor, orderId);
};

const displayFairOrders = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  page: number = 0,
  user?: User,
) => {
  const titleDisplay = createTextDisplay(
    `# ${ctx.locale(`commands:fazendinha.feira.order.${user ? 'user-orders' : 'public-orders'}`, {
      user: getDisplayName(user ?? ctx.user),
    })}`,
  );

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      user
        ? createSection({
            accessory: createButton({
              customId: createCustomId(
                9,
                ctx.user.id,
                ctx.originalInteractionId,
                'PUBLIC',
                embedColor,
              ),
              style: ButtonStyles.Secondary,
              label: ctx.locale('commands:fazendinha.feira.order.view-public-orders'),
            }),
            components: [titleDisplay],
          })
        : titleDisplay,
      createSeparator(),
    ],
  });

  const orders = user
    ? await fairOrderRepository.getUserOrders(farmer.id)
    : await fairOrderRepository.listPublicOrders(
        farmer.id,
        MAX_FAIR_ORDERS_PER_PAGE * page,
        MAX_FAIR_ORDERS_PER_PAGE,
      );

  const totalOrders = user ? orders.length : await fairOrderRepository.countPublicOrders();
  const needPagination = totalOrders > MAX_FAIR_ORDERS_PER_PAGE;
  const totalPages = Math.floor(totalOrders / MAX_FAIR_ORDERS_PER_PAGE) + 1;

  if (orders.length === 0)
    container.components.push(
      createTextDisplay(
        ctx.locale(`commands:fazendinha.feira.order.no-${user ? 'user' : 'public'}-orders`),
      ),
    );
  else
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
                userIsOwner ? 'DELETE' : 'BUY',
                embedColor,
                order._id,
              ),
              disabled: !canClick,
              style: userIsOwner ? ButtonStyles.Danger : ButtonStyles.Primary,
              label: ctx.locale(
                `commands:fazendinha.feira.order.${userIsOwner ? 'delete-order' : 'complete-order'}`,
              ),
            }),
            components: [
              createTextDisplay(
                `### ${Plants[order.plant].emoji} ${order.weight} Kg ${ctx.locale(`data:plants.${order.plant}`)} ${getQualityEmoji(
                  order.quality,
                )}\n${ctx.locale('commands:fazendinha.feira.order.order-description', {
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
                })}`,
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
            page - 1,
          ),
          disabled: page <= 0,
          style: page <= 0 ? ButtonStyles.Secondary : ButtonStyles.Primary,
        }),
        createButton({
          label: ctx.locale('common:next'),
          customId: createCustomId(
            9,
            ctx.user.id,
            ctx.originalInteractionId,
            'PAGE',
            embedColor,
            page + 1,
          ),
          disabled: page >= totalPages - 1,
          style: page >= totalPages - 1 ? ButtonStyles.Secondary : ButtonStyles.Primary,
        }),
      ]),
      createTextDisplay(
        `-# ${ctx.locale('commands:fazendinha.feira.order.pagination', { page: page + 1, totalPages })}`,
      ),
    );

  ctx.makeLayoutMessage({ components: [container] });
};

export { displayFairOrders, handleFairOrderButton };
