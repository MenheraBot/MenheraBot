import { ButtonStyles, MessageFlags } from '@discordeno/bot';
import fairOrderRepository from '../../database/repositories/fairOrderRepository.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { DatabaseFarmerSchema, DatabaseFeirinhaOrderSchema } from '../../types/database.js';
import {
  createAsyncCustomId,
  createButton,
  createContainer,
  createCustomId,
  createLabel,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { MAX_ORDER_IN_FAIR_PER_USER, Plants } from './constants.js';

const handleRequestModal = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  /* 
  const [, , textState] = ctx.sentData;

  const currentState = JSON.parse(textState) as Partial<DatabaseFeirinhaOrderSchema>;
 */

  console.log(farmer.id);
  ctx.respondWithModal({
    title: ctx.locale('commands:fazendinha.feira.order.choose-plant'),
    customId: await createAsyncCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'PLANT_MODAL',
      embedColor,
      '{textState}',
    ),
    components: [
      createLabel({
        label: ctx.locale('commands:fazendinha.feira.order.plant'),
        component: createSelectMenu({
          customId: 'teste',
          options: Object.entries(Plants).map(([plantId, data]) => ({
            label: ctx.locale(`data:plants.${plantId as '1'}`),
            value: plantId,
            emoji: { name: data.emoji },
          })),
        }),
        description: 'descricao',
      }),
    ],
  });
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

  const requestButton = createButton({
    style: ButtonStyles.Success,
    customId: createCustomId(
      9,
      ctx.user.id,
      ctx.originalInteractionId,
      'REQUEST',
      embedColor,
      '{}',
    ),
    label: ctx.locale('commands:fazendinha.feira.order.choose-plant'),
  });

  const container = createContainer({
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
    ],
  });

  if (!('plant' in currentState))
    container.components.push(
      createSection({
        components: [createTextDisplay(`### Pedido\n_Nenhum pedido ainda_`)],
        accessory: requestButton,
      }),
    );

  ctx.makeLayoutMessage({ components: [container] });
};

export { handleCreateFairOrder, handleRequestModal };
