import { ActionRow, TextStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { Plants } from '../fazendinha/plants';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { QuantitativePlant } from '../../types/database';
import { extractFields } from '../../utils/discord/modalUtils';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';
import farmerRepository from '../../database/repositories/farmerRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';

const handleBuySeedsInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [option] = ctx.sentData;

  if (option === 'SHOW_MODAL')
    return showModal(ctx as ComponentInteractionContext<SelectMenuInteraction>);

  if (option === 'BUY')
    return parseModalSumbit(ctx as ComponentInteractionContext<ModalInteraction>);
};

const parseModalSumbit = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
): Promise<void> => {
  const selectedPlants: QuantitativePlant[] = extractFields(ctx.interaction).map((a) => ({
    amount: parseInt(a.value, 10),
    plant: Number(a.customId),
  }));

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  let totalPrice = 0;

  for (let i = 0; i < selectedPlants.length; i++) {
    const plant = selectedPlants[i];

    if (Number.isNaN(plant.amount) || plant.amount <= 0)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: `Você informou um número inválido de sementes para comprar`,
      });

    const fromSeeds = farmer.seeds.find((a) => a.plant === plant.plant);

    if (!fromSeeds) farmer.seeds.push({ amount: plant.amount, plant: plant.plant });
    else fromSeeds.amount += plant.amount;

    totalPrice += plant.amount * Plants[plant.plant].buyValue;
  }

  const userData = await userRepository.ensureFindUser(ctx.user.id);

  if (totalPrice > userData.estrelinhas)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não possui ${totalPrice} :star: estrelinhas para comprar todas essas sementes!`,
    });

  await starsRepository.removeStars(ctx.user.id, totalPrice);
  await farmerRepository.updateSeeds(ctx.user.id, farmer.seeds);

  postTransaction(
    `${ctx.user.id}`,
    `${bot.id}`,
    totalPrice,
    'estrelinhas',
    ApiTransactionReason.BUY_SEED,
  );

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: `Você gastou ${totalPrice} :star: em sementes. Hora de plantá-las!`,
  });
};

const showModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const selectedOptions = ctx.interaction.data.values;
  const [, embedColor] = ctx.sentData;

  const modalFields = selectedOptions.reduce<ActionRow[]>((fields, plant) => {
    fields.push(
      createActionRow([
        createTextInput({
          label: `Comprar semente de ${plant}`,
          customId: plant,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: 2,
          required: true,
          placeholder: `Selecione quantas sementes você quer comprar`,
        }),
      ]),
    );

    return fields;
  }, []);

  await ctx.respondWithModal({
    customId: createCustomId(4, ctx.user.id, ctx.commandId, 'BUY', embedColor),
    title: 'Comprar Sementes',
    components: modalFields,
  });
};

const buySeeds = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  finishCommand();

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (farmer.biggestSeed === 0)
    return ctx.makeMessage({
      content: `Você precisa colher mais ${10 - farmer.plantedFields} ${
        Plants[farmer.biggestSeed].emoji
      } para poder comprar sementes`,
    });

  const selectMenu = createSelectMenu({
    customId: createCustomId(
      4,
      ctx.user.id,
      ctx.commandId,
      'SHOW_MODAL',
      ctx.authorData.selectedColor,
    ),
    options: [],
    minValues: 1,
    placeholder: 'Selecione as sementes que você quer comprar',
  });

  const embed = createEmbed({
    title: 'Comprar Sementes',
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: Object.entries(Plants)
      .filter((a) => a[0] !== '0')
      .map(([plant, data]) => {
        if (farmer.biggestSeed >= Number(plant))
          selectMenu.options.push({ label: `Sementede de ${plant}`, value: `${plant}` });

        return {
          name: `${plant}`,
          inline: true,
          value: `Valor da planta: ${data.sellValue}\nMadura em ${data.minutesToHarvest} minutos\nApodrece em ${data.minutesToRot} minutos`,
        };
      }),
    footer: {
      text: `Colha mais ${10 - farmer.plantedFields} ${
        Plants[farmer.biggestSeed as 1].emoji
      } para liberar a próxima planta`,
    },
  });

  selectMenu.maxValues = selectMenu.options.length > 5 ? 5 : selectMenu.options.length;

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([selectMenu])],
  });
};

export { buySeeds, handleBuySeedsInteractions };
