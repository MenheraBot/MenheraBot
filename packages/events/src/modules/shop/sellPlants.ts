import { bot } from '../../index.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { ApiTransactionReason } from '../../types/api.js';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database.js';
import { ModalInteraction } from '../../types/interaction.js';
import { InteractionContext } from '../../types/menhera.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { extractFields } from '../../utils/discord/modalUtils.js';
import { Plants } from '../fazendinha/constants.js';
import {
  filterPlant,
  getPlantPrice,
  getQuality,
  getQualityEmoji,
} from '../fazendinha/siloUtils.js';
import { createTextDisplay } from '../../utils/discord/componentUtils.js';
import { buildSellPlantsMessage } from '../fazendinha/displaySilo.js';
import { MessageFlags } from '@discordeno/bot';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';

const receiveModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const selectedPlants: QuantitativePlant[] = extractFields(ctx.interaction).map((a) => {
    const [plant, quality] = a.customId.split('|');

    return {
      weight: parseFloat(Number(a.value.replace(',', '.')).toFixed(1)),
      plant: Number(plant),
      quality: Number(quality),
    };
  });

  for (const plant of selectedPlants) {
    if (Number.isNaN(plant.weight))
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
          ),
        ],
      });

    if (plant.weight <= 0)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
          ),
        ],
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
  const soldPlants = [];

  for (let i = selectedPlants.length - 1; i >= 0; i--) {
    const currentPlant = selectedPlants[i];
    const fromSilo = farmer.silo.find(filterPlant(currentPlant));

    if (!fromSilo || fromSilo.weight < currentPlant.weight)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:loja.sell_plants.not-enough', {
              amount: currentPlant.weight,
              plant: ctx.locale(`data:plants.${currentPlant.plant}`),
            }),
          ),
        ],
      });

    if (currentPlant.weight <= 0)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount'),
          ),
        ],
      });

    const plant = Plants[currentPlant.plant];
    const plantQuality = getQuality(currentPlant);
    const plantPrice = getPlantPrice(currentPlant);

    totalStars += Math.floor(currentPlant.weight * plantPrice);
    soldPlants.push(`${getQualityEmoji(plantQuality)}${plant.emoji} **${currentPlant.weight} kg**`);
    fromSilo.weight = parseFloat((fromSilo.weight - currentPlant.weight).toFixed(1));

    if (fromSilo.weight <= 0) farmer.silo.splice(farmer.silo.findIndex(filterPlant(fromSilo)), 1);
  }

  if (totalStars === 0)
    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:loja.sell_plants.invalid-amount')),
      ],
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

  const updatedFarmer = await farmerRepository.getFarmer(ctx.user.id);

  const successMessage = {
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('success', 'commands:loja.sell_plants.success', {
          amount: totalStars,
          stars: userData.estrelinhas,
          plants: soldPlants.join(', '),
        }),
      ),
    ],
  };

  if (updatedFarmer.silo.filter((a) => a.weight > 0).length === 0)
    return ctx.makeLayoutMessage(successMessage);

  await buildSellPlantsMessage(ctx, updatedFarmer, userData.selectedColor);

  return ctx.followUp(successMessage);
};

export { executeSellPlant, receiveModal };
