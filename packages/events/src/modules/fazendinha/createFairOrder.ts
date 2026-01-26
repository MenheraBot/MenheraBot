import { ButtonComponent, ButtonStyles, MessageFlags, TextStyles } from '@discordeno/bot';
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
import { Items, MAX_ORDER_IN_FAIR_PER_USER, Plants } from './constants.js';
import { AvailableItems, AvailablePlants, PlantQuality } from './types.js';
import { getQualityEmoji } from './siloUtils.js';
import { ModalInteraction } from '../../types/interaction.js';
import { extractLayoutFields } from '../../utils/discord/modalUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils.js';
import userRepository from '../../database/repositories/userRepository.js';

const handleRequestModal = async (ctx: ComponentInteractionContext, embedColor: string) => {
  const [, , textState] = ctx.sentData;

  const currentState = JSON.parse(textState) as Partial<DatabaseFeirinhaOrderSchema>;

  ctx.respondWithModal({
    title: ctx.locale('commands:fazendinha.feira.order.edit-request'),
    customId: await createAsyncCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'PLANT_MODAL',
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

const handleAddAwardModal = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const [, , stateText, type] = ctx.sentData;

  console.log(farmer.id);

  return ctx.respondWithModal({
    title: ctx.locale(`commands:fazendinha.feira.order.add-${type as 'item'}`),
    components: [
      createLabel({
        label: 'Pegar',
        component: createTextInput({
          customId: 'input',
          style: TextStyles.Short,
          maxLength: 3,
          required: true,
          placeholder: '3,5 Kg',
        }),
      }),
    ],
    customId: await createAsyncCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'AWARD_MODAL',
      embedColor,
      stateText,
    ),
  });
};

const getCreateFairOrderMessage = async (
  ctx: InteractionContext,
  embedColor: string,
  farmer: DatabaseFarmerSchema,
  currentState: Partial<DatabaseFeirinhaOrderSchema>,
) => {
  const user = await userRepository.ensureFindUser(farmer.id);

  const userHaveFertilizer = farmer.items.some(
    (a) => a.amount > 0 && a.id === AvailableItems.Fertilizer,
  );
  const userHavePlants = farmer.silo.some((a) => a.weight >= 1);
  const userHaveStars = user.estrelinhas > 0;

  const hasRequest = 'plant' in currentState;
  const hasAwards = currentState.awards && currentState.awards.length > 0;

  const textState = JSON.stringify(currentState);

  const requestButton = createButton({
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

  const createAwardButton = async (
    type: DatabaseFeirinhaOrderSchema['awards'][number]['type'],
    emoji: ButtonComponent['emoji'],
    disabled?: boolean,
  ) =>
    createButton({
      style: hasAwards ? ButtonStyles.Primary : ButtonStyles.Success,
      emoji,
      label: ctx.locale(`commands:fazendinha.feira.order.add-${type}`),
      disabled: disabled || currentState.awards?.some?.((a) => a.type === type),
      customId: await createAsyncCustomId(
        9,
        ctx.user.id,
        ctx.originalInteractionId,
        'ADD_AWARD',
        embedColor,
        textState,
        type,
      ),
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
            `### ${ctx.locale('commands:fazendinha.feira.order.order')}\n${
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
        ],
        accessory: requestButton,
      }),
      createSeparator(),
      createActionRow([
        ...(await Promise.all([
          createAwardButton(
            'item',
            extractNameAndIdFromEmoji(Items[AvailableItems.Fertilizer].emoji),
            !userHaveFertilizer,
          ),
          createAwardButton('plant', { name: Plants[AvailablePlants.Mate].emoji }, !userHavePlants),
          createAwardButton('estrelinhas', { name: ctx.safeEmoji('estrelinhas') }, !userHaveStars),
        ])),
        createButton({
          style: ButtonStyles.Secondary,
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

  let isInvalid = false;

  fields.forEach((f) => {
    const parsed =
      f.customId === 'weight' ? parseFloat(parseFloat(f.value).toFixed(1)) : parseInt(f.value);

    if (Number.isNaN(parsed)) isInvalid = true;

    currentState[f.customId as 'plant'] = parsed;
  });

  if (isInvalid)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.invalid-values'),
    });

  const container = await getCreateFairOrderMessage(ctx, embedColor, farmer, currentState);

  return ctx.makeLayoutMessage({ components: [container] });
};

const handleCreateFairOrder = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const userRequests = await fairOrderRepository.getUserOrders(farmer.id);

  if (userRequests.length >= MAX_ORDER_IN_FAIR_PER_USER)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.order.max-orders'),
      flags: MessageFlags.Ephemeral,
    });

  const [, , textState] = ctx.sentData;

  const currentState = JSON.parse(textState ?? '{}') as Partial<DatabaseFeirinhaOrderSchema>;

  const container = await getCreateFairOrderMessage(ctx, embedColor, farmer, currentState);

  return ctx.makeLayoutMessage({ components: [container] });
};

export { handleCreateFairOrder, handleRequestModal, handleReceiveModal, handleAddAwardModal };
