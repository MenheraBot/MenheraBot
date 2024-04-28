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
import { Plants } from '../fazendinha/constants';

const receiveModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const selectedPlants: QuantitativePlant[] = extractFields(ctx.interaction).map((a) => ({
    weight: parseFloat(Number(a.value).toFixed(1)),
    plant: Number(a.customId),
  }));

  for (let i = 0; i < selectedPlants.length; i++) {
    const plant = selectedPlants[i];

    if (Number.isNaN(plant.weight))
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
      });

    if (plant.weight <= 0)
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

    if (!fromSilo || fromSilo.weight < currentPlant.weight)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.not-enough', {
          amount: currentPlant.weight,
          plant: ctx.locale(`data:plants.${currentPlant.plant}`),
        }),
      });

    if (currentPlant.weight < 0)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
      });

    totalStars += Math.floor(currentPlant.weight * Plants[currentPlant.plant].sellValue);
    fromSilo.weight = parseFloat((fromSilo.weight - currentPlant.weight).toFixed(1));

    if (fromSilo.weight <= 0)
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
