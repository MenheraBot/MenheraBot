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
import commandRepository from '../../database/repositories/commandRepository';

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
        content: ctx.prettyResponse('error', 'commands:loja.buy_seeds.invalid-amount'),
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
      content: ctx.prettyResponse('error', 'commands:loja.buy_seeds.not-enough-stars', {
        amount: totalPrice,
      }),
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

  const commandInfo = await commandRepository.getCommandInfo('fazendinha');

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:loja.buy_seeds.success', {
      amount: totalPrice,
      command: `</fazendinha plantações:${commandInfo?.discordId}>`,
      stars: userData.estrelinhas - totalPrice,
    }),
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
          label: ctx.locale('commands:loja.buy_seeds.buy-seed-of', {
            plant: ctx.locale(`data:plants.${plant as '1'}`),
          }),
          customId: plant,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: 2,
          required: true,
          placeholder: ctx.locale('commands:loja.buy_seeds.select-amount'),
        }),
      ]),
    );

    return fields;
  }, []);

  await ctx.respondWithModal({
    customId: createCustomId(4, ctx.user.id, ctx.commandId, 'BUY', embedColor),
    title: ctx.locale('commands:loja.buy_seeds.embed-title'),
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
      content: ctx.prettyResponse('lock', 'commands:loja.buy_seeds.seed-limit', {
        amount: 10 - farmer.plantedFields,
        emoji: Plants[farmer.biggestSeed].emoji,
      }),
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
    placeholder: ctx.locale('commands:loja.buy_seeds.select'),
  });

  const embed = createEmbed({
    title: ctx.locale('commands:loja.buy_seeds.embed-title'),
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: Object.entries(Plants)
      .filter((a) => a[0] !== '0')
      .map(([plant, data]) => {
        if (farmer.biggestSeed >= Number(plant))
          selectMenu.options.push({
            label: ctx.locale(`commands:loja.buy_seeds.seed`, {
              plant: ctx.locale(`data:plants.${plant as '1'}`),
            }),
            emoji: { name: Plants[plant as '1'].emoji },
            value: `${plant}`,
          });

        return {
          name: `${Plants[plant as '1'].emoji} ${ctx.locale(`data:plants.${plant as '1'}`)}`,
          inline: true,
          value: ctx.locale('commands:loja.buy_seeds.plant-stats', {
            sellValue: data.sellValue,
            buyValue: data.buyValue,
            harvestTime: data.minutesToHarvest,
            rotTime: data.minutesToRot,
          }),
        };
      }),
    footer: {
      text: ctx.locale('commands:loja.buy_seeds.harvest-more', {
        amount: 10 - farmer.plantedFields,
        emoji: Plants[farmer.biggestSeed as 1].emoji,
      }),
    },
  });

  selectMenu.maxValues = selectMenu.options.length > 5 ? 5 : selectMenu.options.length;

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([selectMenu])],
  });
};

export { buySeeds, handleBuySeedsInteractions };
