import { ButtonStyles, LabelComponent, MessageFlags, TextStyles } from '@discordeno/bot';
import fairOrderRepository from '../../database/repositories/fairOrderRepository.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { DatabaseFarmerSchema, DatabaseFeirinhaOrderSchema } from '../../types/database.js';
import {
  createActionRow,
  createAsyncCustomId,
  createButton,
  createContainer,
  createCustomId,
  createLabel,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  Items,
  MAX_ITEMS_AWARD_IN_FAIR_ORDER,
  MAX_TRADE_REQUESTS_IN_FAIR_PER_USER,
  MAX_STARS_AWARD_IN_FAIR_ORDER,
  MAX_WEIGHT_IN_FAIR_ORDER,
  Plants,
} from './constants.js';
import { AvailableItems, PlantQuality } from './types.js';
import { getQualityEmoji, removeItems } from './siloUtils.js';
import { ModalInteraction } from '../../types/interaction.js';
import { extractLayoutFields } from '../../utils/discord/modalUtils.js';
import userRepository from '../../database/repositories/userRepository.js';
import { isUndefined } from '../../utils/miscUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { displayFairOrders } from './fairOrders.js';
import executeDailies from '../dailies/executeDailies.js';

const handleTradeRequestModal = async (ctx: ComponentInteractionContext, embedColor: string) => {
  const [, , textState] = ctx.sentData;

  const currentState = JSON.parse(textState) as Partial<DatabaseFeirinhaOrderSchema>;

  ctx.respondWithModal({
    title: ctx.locale('commands:fazendinha.feira.order.edit-request'),
    customId: await createAsyncCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'MODAL',
      embedColor,
      textState,
    ),
    components: [
      createLabel({
        label: ctx.locale('commands:fazendinha.feira.order.plant'),
        component: createSelectMenu({
          customId: 'plant',
          required: true,
          options: Object.entries(Plants).map(([plantId, data]) => ({
            label: ctx.locale(`data:plants.${plantId as '1'}`),
            value: plantId,
            emoji: { name: data.emoji },
            default: `${currentState.plant}` === plantId,
          })),
        }),
      }),
      createLabel({
        label: ctx.locale('commands:fazendinha.feira.order.quality'),
        component: createSelectMenu({
          customId: 'quality',
          required: true,
          options: [PlantQuality.Best, PlantQuality.Normal, PlantQuality.Worst].map((quality) => ({
            label: ctx.locale(`data:fazendinha.quality_${quality}`),
            value: `${quality}`,
            emoji: { name: getQualityEmoji(quality) },
            default: currentState.quality === quality,
          })),
        }),
      }),
      createLabel({
        label: ctx.locale('commands:fazendinha.feira.order.weight'),
        component: createTextInput({
          customId: 'weight',
          required: true,
          style: TextStyles.Short,
          placeholder: '7,3 Kg',
          maxLength: 3,
          minLength: 1,
          value: currentState.weight ? `${currentState.weight}` : undefined,
        }),
      }),
    ],
  });
};

const handleAddAwardButton = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const [, , stateText] = ctx.sentData as [never, never, string];

  const currentState = JSON.parse(stateText) as Partial<DatabaseFeirinhaOrderSchema>;

  const user = await userRepository.ensureFindUser(farmer.id);

  const addStars = user.estrelinhas > 0;
  const addItem = farmer.items.some((a) => a.id === AvailableItems.Fertilizer && a.amount > 0);

  const components: LabelComponent[] = [];

  if (addStars)
    components.push(
      createLabel({
        label: ctx.locale(`commands:fazendinha.feira.order.add-estrelinhas`),
        component: createTextInput({
          customId: 'estrelinhas',
          style: TextStyles.Short,
          required: !addItem,
          minLength: 1,
          maxLength: `${Math.min(MAX_STARS_AWARD_IN_FAIR_ORDER, user.estrelinhas)}`.length,
          placeholder: '25000',
          value: currentState.awards?.estrelinhas
            ? `${currentState.awards?.estrelinhas}`
            : undefined,
        }),
      }),
    );

  if (addItem)
    components.push(
      createLabel({
        label: ctx.locale(`commands:fazendinha.feira.order.add-item`),
        component: createTextInput({
          customId: 'fertilizers',
          style: TextStyles.Short,
          required: !addStars,
          maxLength: `${MAX_ITEMS_AWARD_IN_FAIR_ORDER}`.length,
          placeholder: '2',
          value: currentState.awards?.fertilizers
            ? `${currentState.awards?.fertilizers}`
            : undefined,
        }),
        description:
          addItem && addStars
            ? ctx.locale('commands:fazendinha.feira.order.add-award-description')
            : undefined,
      }),
    );

  if (components.length === 0)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.no-awards-available'),
    });

  return ctx.respondWithModal({
    title: ctx.locale(`commands:fazendinha.feira.order.add-award`),
    components,
    customId: await createAsyncCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'MODAL',
      embedColor,
      stateText,
    ),
  });
};

const getCreateFairOrderMessage = async (
  ctx: ComponentInteractionContext,
  embedColor: string,
  farmer: DatabaseFarmerSchema,
  currentState: Partial<DatabaseFeirinhaOrderSchema>,
) => {
  const user = await userRepository.ensureFindUser(farmer.id);

  const userHaveStars = user.estrelinhas > 0;
  const userHaveFertilizer = farmer.items.some(
    (a) => a.amount > 0 && a.id === AvailableItems.Fertilizer,
  );

  if (!userHaveFertilizer && !userHaveStars) return false;

  const hasRequest = 'plant' in currentState;
  const hasAwards = 'awards' in currentState;

  const textState = JSON.stringify(currentState);

  const editOrder = createButton({
    style: hasRequest ? ButtonStyles.Primary : ButtonStyles.Success,
    customId: await createAsyncCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'REQUEST',
      embedColor,
      textState,
    ),
    label: ctx.locale(`commands:fazendinha.feira.order.${hasRequest ? 'edit' : 'create'}-order`),
  });

  return createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        accessory: createButton({
          customId: createCustomId(9, ctx.user.id, ctx.originalInteractionId, 'PUBLIC', embedColor),
          style: ButtonStyles.Secondary,
          label: ctx.locale('common:cancel'),
        }),
        components: [
          createTextDisplay(`## ${ctx.locale('commands:fazendinha.feira.order.trade-request')}`),
          createTextDisplay(ctx.locale('commands:fazendinha.feira.order.create-order-description')),
        ],
      }),
      createSeparator(),
      createSection({
        components: [
          createTextDisplay(
            `### ${
              hasRequest
                ? `**${ctx.locale('commands:fazendinha.feira.order.order-name', {
                    plantEmoji: Plants[currentState.plant ?? 0]?.emoji,
                    weight: currentState.weight,
                    qualityEmoji: getQualityEmoji(currentState.quality ?? 0),
                    plantName: ctx.locale(`data:plants.${currentState.plant ?? 1}`),
                  })}**`
                : `_${ctx.locale('commands:fazendinha.feira.order.no-order')}_`
            }`,
          ),
          createTextDisplay(
            currentState.awards
              ? `- ${Object.entries(currentState.awards)
                  .map(([type, amount]) =>
                    ctx.locale('commands:fazendinha.feira.order.order-award', {
                      amount,
                      metric: type === 'estrelinhas' ? '' : 'x',
                      emoji:
                        type === 'estrelinhas'
                          ? ctx.safeEmoji(type)
                          : Items[AvailableItems.Fertilizer].emoji,
                    }),
                  )
                  .join(`\n- `)}`
              : ctx.locale('commands:fazendinha.feira.order.no-awards'),
          ),
        ],
        accessory: createButton({
          style: hasAwards ? ButtonStyles.Primary : ButtonStyles.Success,
          label: ctx.locale(`commands:fazendinha.feira.order.edit-award`),
          customId: await createAsyncCustomId(
            9,
            ctx.user.id,
            ctx.originalInteractionId,
            'EDIT_AWARD',
            embedColor,
            textState,
          ),
        }),
      }),
      createSeparator(),
      createActionRow([
        editOrder,
        createButton({
          style: hasAwards ? ButtonStyles.Success : ButtonStyles.Secondary,
          label: ctx.locale('commands:fazendinha.feira.order.create-order'),
          disabled: !hasAwards,
          customId: await createAsyncCustomId(
            9,
            ctx.user.id,
            ctx.originalInteractionId,
            'PLACE_ORDER',
            embedColor,
            textState,
          ),
        }),
      ]),
    ],
  });
};

const handleReceiveModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const [, , textState] = ctx.sentData;
  const currentState = JSON.parse(textState) as Partial<DatabaseFeirinhaOrderSchema>;

  const fields = extractLayoutFields(ctx.interaction);

  let invalidReason = '';

  fields.forEach((f) => {
    if (typeof f.value === 'undefined') {
      if (currentState?.awards?.[f.customId as 'estrelinhas']) {
        delete currentState.awards[f.customId as 'estrelinhas'];

        if (Object.keys(currentState.awards).length === 0) delete currentState.awards;
      }

      return;
    }

    const parsed =
      f.customId === 'weight'
        ? parseFloat(parseFloat(f.value.replace(',', '.')).toFixed(1))
        : parseInt(f.value);

    if (f.customId === 'weight' && parsed > MAX_WEIGHT_IN_FAIR_ORDER)
      invalidReason = ctx.prettyResponse(
        'error',
        'commands:fazendinha.feira.order.invalid-weight',
        { limit: MAX_WEIGHT_IN_FAIR_ORDER },
      );

    if (Number.isNaN(parsed) || (f.customId !== 'plant' && parsed < 1)) {
      invalidReason = ctx.prettyResponse('error', 'commands:fazendinha.feira.order.invalid-values');
      return;
    }

    if (['fertilizers', 'estrelinhas'].includes(f.customId)) {
      if (!currentState.awards) currentState.awards = {};

      currentState.awards[f.customId as 'estrelinhas'] = parsed;
    } else currentState[f.customId as 'plant'] = parsed;
  });

  if (invalidReason)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: invalidReason,
    });

  const container = await getCreateFairOrderMessage(ctx, embedColor, farmer, currentState);

  if (!container)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.no-awards-available'),
    });

  return ctx.makeLayoutMessage({ components: [container] });
};

const handleCreateFairOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const userRequests = await fairOrderRepository.getUserOrders(farmer.id);

  if (userRequests.length >= MAX_TRADE_REQUESTS_IN_FAIR_PER_USER)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.max-orders'),
      flags: MessageFlags.Ephemeral,
    });

  const [, , textState] = ctx.sentData;

  const currentState = JSON.parse(textState ?? '{}') as Partial<DatabaseFeirinhaOrderSchema>;

  const container = await getCreateFairOrderMessage(ctx, embedColor, farmer, currentState);

  if (!container)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.no-awards-available'),
    });

  return ctx.makeLayoutMessage({ components: [container] });
};

const handlePlaceOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const [, , textState] = ctx.sentData;
  const order = JSON.parse(textState) as Partial<DatabaseFeirinhaOrderSchema>;

  if (
    isUndefined(order.awards) ||
    isUndefined(order.plant) ||
    isUndefined(order.quality) ||
    isUndefined(order.weight) ||
    (isUndefined(order.awards.estrelinhas) && isUndefined(order.awards.fertilizers))
  )
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.invalid-values'),
    });

  const userData = await userRepository.ensureFindUser(farmer.id);

  if (order.awards.estrelinhas && order.awards.estrelinhas > userData.estrelinhas)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.poor-stars'),
    });

  if (
    order.awards.fertilizers &&
    order.awards.fertilizers >
      farmer.items.reduce(
        (p, c) => (c.id === AvailableItems.Fertilizer && c.amount > 0 ? p + c.amount : p),
        0,
      )
  )
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.poor-items'),
    });

  const userOrders = await fairOrderRepository.getUserOrders(farmer.id);

  if (userOrders.length >= MAX_TRADE_REQUESTS_IN_FAIR_PER_USER)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.max-orders'),
      flags: MessageFlags.Ephemeral,
    });

  await fairOrderRepository.placeOrder(
    ctx.user.id,
    order.plant,
    order.weight,
    order.quality,
    order.awards,
  );

  if (order.awards.estrelinhas) {
    await starsRepository.removeStars(ctx.user.id, order.awards.estrelinhas);
    await postTransaction(
      `${ctx.user.id}`,
      `${bot.id}`,
      order.awards.estrelinhas,
      'estrelinhas',
      ApiTransactionReason.FAIR,
    );
  }

  if (order.awards.fertilizers) {
    const newItems = removeItems(farmer.items, [
      { id: AvailableItems.Fertilizer, amount: order.awards.fertilizers },
    ]);
    await farmerRepository.updateItems(farmer.id, newItems);
  }

  await displayFairOrders(ctx, farmer, embedColor);

  await executeDailies.tradeRequest(userData);

  return ctx.followUp({
    flags: MessageFlags.Ephemeral,
    content: ctx.prettyResponse('success', 'commands:fazendinha.feira.order.order-placed'),
  });
};

export {
  handleCreateFairOrder,
  handleTradeRequestModal,
  handleReceiveModal,
  handleAddAwardButton,
  handlePlaceOrder,
};
