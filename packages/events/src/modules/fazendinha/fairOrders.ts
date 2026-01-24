import { ButtonStyles, User } from '@discordeno/bot';
import { InteractionContext } from '../../types/menhera.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import {
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import fairOrderRepository from '../../database/repositories/fairOrderRepository.js';
import { MAX_FAIR_ORDERS_PER_PAGE } from './constants.js';

const displayFairOrders = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  page: number = 0,
  user?: User,
) => {
  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [createTextDisplay(`Pedidos da Vizinhança\n${farmer.id} + ${user?.globalName}`)],
  });

  const orders = user
    ? await fairOrderRepository.getUserOrders(farmer.id)
    : await fairOrderRepository.listPublicOrders(
        farmer.id,
        MAX_FAIR_ORDERS_PER_PAGE * page,
        MAX_FAIR_ORDERS_PER_PAGE,
      );

  orders.forEach((order) => {
    container.components.push(
      createSection({
        accessory: createButton({
          customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'DELETEBNIU'),
          style: ButtonStyles.Primary,
          label: `Deletar ou Entregar`,
        }),
        components: [
          createTextDisplay(
            `## - ${order.plant} ${order.weight} kg ${order.quality} ${order.userId}`,
          ),
        ],
      }),
    );
  });

  ctx.makeLayoutMessage({ components: [container] });
};

export { displayFairOrders };
