import { bot } from '../..';
import farmerRepository from '../../database/repositories/farmerRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { ApiTransactionReason } from '../../types/api';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { Plants } from '../fazendinha/plants';

const executeSellPlant = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  selectedPlants: QuantitativePlant[],
): Promise<void> => {
  let totalStars = 0;
  for (let i = 0; i < selectedPlants.length; i++) {
    const currentPlant = selectedPlants[i];
    const fromSilo = farmer.silo.find((a) => a.plant === currentPlant.plant);

    if (!fromSilo || fromSilo.amount < currentPlant.amount)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: `Você não tem ${currentPlant.amount} ${currentPlant.plant} para vender!`,
      });

    totalStars += currentPlant.amount * Plants[currentPlant.plant].sellValue;
    fromSilo.amount -= currentPlant.amount;
  }

  starsRepository.addStars(ctx.user.id, totalStars);

  postTransaction(
    `${bot.id}`,
    `${ctx.user.id}`,
    totalStars,
    'estrelinhas',
    ApiTransactionReason.SELL_PLANT,
  );

  await farmerRepository.updateSilo(ctx.user.id, farmer.silo);

  ctx.makeMessage({
    content: `Suas plantas foram vendidas por **${totalStars}** :star:`,
    components: [],
    embeds: [],
  });
};

export { executeSellPlant };
