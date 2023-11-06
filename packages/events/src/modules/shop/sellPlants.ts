import { bot } from '../..';
import farmerRepository from '../../database/repositories/farmerRepository';
import starsRepository from '../../database/repositories/starsRepository';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ApiTransactionReason } from '../../types/api';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database';
import { ModalInteraction } from '../../types/interaction';
import { InteractionContext } from '../../types/menhera';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { extractFields } from '../../utils/discord/modalUtils';
import { Plants } from '../fazendinha/constainst';

const receiveModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const selectedPlants: QuantitativePlant[] = extractFields(ctx.interaction).map((a) => ({
    amount: parseInt(a.value, 10),
    plant: Number(a.customId),
  }));

  for (let i = 0; i < selectedPlants.length; i++) {
    const plant = selectedPlants[i];

    if (Number.isNaN(plant.amount))
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
      });

    if (plant.amount <= 0)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
      });
  }

  executeSellPlant(ctx, farmer, selectedPlants);
};

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
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.not-enough', {
          amount: currentPlant.amount,
          plant: ctx.locale(`data:plants.${currentPlant.plant}`),
        }),
      });

    if (currentPlant.amount < 0)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
      });

    totalStars += currentPlant.amount * Plants[currentPlant.plant].sellValue;
    fromSilo.amount -= currentPlant.amount;

    if (fromSilo.amount <= 0)
      farmer.silo.splice(
        farmer.silo.findIndex((a) => a.plant === fromSilo.plant),
        1,
      );
  }

  if (totalStars === 0)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
    });

  await Promise.all([
    starsRepository.addStars(ctx.user.id, totalStars),
    postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      totalStars,
      'estrelinhas',
      ApiTransactionReason.SELL_PLANT,
    ),
    farmerRepository.updateSilo(ctx.user.id, farmer.silo),
  ]);

  const userData = await userRepository.ensureFindUser(ctx.user.id);

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:loja.sell_plants.success', {
      amount: totalStars,
      stars: userData.estrelinhas,
    }),
    components: [],
    embeds: [],
  });
};

export { executeSellPlant, receiveModal };
