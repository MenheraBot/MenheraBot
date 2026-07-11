import {
  ActionRow,
  ButtonStyles,
  SeparatorComponent,
  TextDisplayComponent,
  TextStyles,
} from '@discordeno/bot';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction.js';
import { hexStringToNumber, numberToHexString } from '../../utils/discord/embedUtils.js';
import { PLANT_CATEGORY_EMOJIS, Plants } from '../fazendinha/constants.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
  createTextInput,
  deleteMessageCustomId,
} from '../../utils/discord/componentUtils.js';
import { QuantitativeSeed } from '../../types/database.js';
import { extractFields } from '../../utils/discord/modalUtils.js';
import userRepository from '../../database/repositories/userRepository.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import { getSiloLimits, isMatePlant } from '../fazendinha/siloUtils.js';
import { MessageFlags } from '@discordeno/bot';
import { SeasonEmojis } from '../fazendinha/displayPlantations.js';
import { PlantCategories } from '../fazendinha/types.js';
import { InteractionContext } from '../../types/menhera.js';

const handleBuySeedsInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [option, embedColor] = ctx.sentData;

  if (option === 'SHOW_MODAL')
    return showModal(ctx as ComponentInteractionContext<SelectMenuInteraction>, embedColor);

  if (option === 'BUY')
    return parseModalSumbit(ctx as ComponentInteractionContext<ModalInteraction>, embedColor);

  if (option === 'CHANGE_CATEGORY') {
    const selectedCategory = (ctx as ComponentInteractionContext<SelectMenuInteraction>).interaction
      .data.values[0];

    return buySeeds(ctx, Number(selectedCategory), embedColor);
  }
};

const parseModalSumbit = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  embedColor: string,
): Promise<void> => {
  const selectedPlants: QuantitativeSeed[] = extractFields(ctx.interaction).map((a) => ({
    amount: parseInt(a.value, 10),
    plant: Number(a.customId),
  }));

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  let totalPrice = 0;

  for (const plant of selectedPlants) {
    if (Number.isNaN(plant.amount) || plant.amount <= 0)
      return ctx.respondInteraction({
        flags: MessageFlags.Ephemeral,
        content: ctx.prettyResponse('error', 'commands:loja.buy_seeds.invalid-amount'),
      });

    const fromSeeds = farmer.seeds.find((a) => a.plant === plant.plant);

    if (!fromSeeds) farmer.seeds.push({ amount: plant.amount, plant: plant.plant });
    else fromSeeds.amount += plant.amount;

    totalPrice += plant.amount * Plants[plant.plant].buyValue;
  }

  const userLimits = getSiloLimits(farmer);

  if (userLimits.used > getSiloLimits(farmer).limit)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
        limit: userLimits.limit,
      }),
      flags: MessageFlags.Ephemeral,
    });

  const userData = await userRepository.ensureFindUser(ctx.user.id);

  if (totalPrice > userData.estrelinhas)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:loja.buy_seeds.not-enough-stars', {
        amount: totalPrice,
      }),
    });

  await Promise.all([
    starsRepository.removeStars(ctx.user.id, totalPrice),
    farmerRepository.updateSeeds(ctx.user.id, farmer.seeds),
    postTransaction(
      `${ctx.user.id}`,
      `${bot.id}`,
      totalPrice,
      'estrelinhas',
      ApiTransactionReason.BUY_SEED,
    ),
  ]);

  await buySeeds(ctx, PlantCategories.Grain, embedColor);

  const commandInfo = await commandRepository.getCommandInfo('fazendinha');

  return ctx.followUp({
    flags: MessageFlags.Ephemeral,
    content: ctx.prettyResponse('success', 'commands:loja.buy_seeds.success', {
      amount: totalPrice,
      command: `</fazendinha plantações:${commandInfo?.discordId}>`,
      stars: userData.estrelinhas - totalPrice,
    }),
  });
};

const showModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  embedColor: string,
): Promise<void> => {
  const selectedOptions = ctx.interaction.data.values;

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
    customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'BUY', embedColor),
    title: ctx.locale('commands:loja.buy_seeds.embed-title'),
    components: modalFields,
  });
};

const getBuySeedsComponents = (
  ctx: InteractionContext,
  category: PlantCategories,
  isTutorial?: boolean,
): [ActionRow, (TextDisplayComponent | SeparatorComponent)[], ActionRow] => {
  const embedColor = numberToHexString(ctx.userColor);

  const textComponents: (TextDisplayComponent | SeparatorComponent)[] = [];

  const buySeedCustomId = isTutorial
    ? createCustomId(12, ctx.user.id, ctx.originalInteractionId, 'BUY_SEED', category)
    : createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'SHOW_MODAL', embedColor);

  const selectCategoryCustomId = isTutorial
    ? createCustomId(12, ctx.user.id, ctx.originalInteractionId, 'CHANGE_CATEGORY')
    : createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'CHANGE_CATEGORY', embedColor);

  const buySeedSelectMenu = createSelectMenu({
    customId: buySeedCustomId,
    options: [],
    minValues: 1,
    maxValues: isTutorial ? 1 : 5,
    placeholder: ctx.locale('commands:loja.buy_seeds.select'),
  });

  const categorySelectMenu = createSelectMenu({
    customId: selectCategoryCustomId,
    options: Object.entries(PlantCategories).flatMap(([id]) => {
      const numberId = Number(id);
      if (Number.isNaN(numberId)) return [];

      return [
        {
          label: ctx.locale(`data:fazendinha.category_${numberId as 1}`),
          value: id,
          default: numberId === category,
          emoji: { name: PLANT_CATEGORY_EMOJIS[id as '1'] },
        },
      ];
    }),
    minValues: 1,
    maxValues: 1,
    required: true,
  });

  Object.entries(Plants).forEach(([plant, data]) => {
    if (!isMatePlant(Number(plant)))
      buySeedSelectMenu.options.push({
        label: ctx.locale(`commands:loja.buy_seeds.seed`, {
          plant: ctx.locale(`data:plants.${plant as '1'}`),
        }),
        emoji: { name: Plants[plant as '1'].emoji },
        value: plant,
      });

    if (data.category !== category) return;

    textComponents.push(
      createSeparator(),
      createTextDisplay(
        `### ${Plants[plant as '1'].emoji} ${ctx.locale(`data:plants.${plant as '1'}`)}\n${ctx.locale(
          'commands:loja.buy_seeds.plant-stats',
          {
            sellValue: data.sellValue,
            buyValue: data.buyValue,
            harvestTime: data.minutesToHarvest,
            rotTime: data.minutesToRot,
            bestSeason: SeasonEmojis[data.bestSeason],
            worstSeason: SeasonEmojis[data.worstSeason],
          },
        )}`,
      ),
    );
  });

  return [
    createActionRow([categorySelectMenu]),
    textComponents,
    createActionRow([buySeedSelectMenu]),
  ];
};

const buySeeds = async (
  ctx: InteractionContext,
  currentCategory: PlantCategories,
  embedColor: string,
): Promise<void> => {
  const [categorySelectMenu, textComponents, selectMenu] = getBuySeedsComponents(
    ctx,
    currentCategory,
  );

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        components: [
          createTextDisplay(`## ${ctx.locale('commands:loja.buy_seeds.embed-title')}`),
          createTextDisplay(ctx.locale('commands:loja.buy_seeds.select-category')),
        ],
        accessory: createButton({
          style: ButtonStyles.Secondary,
          label: ctx.locale('common:close'),
          customId: deleteMessageCustomId(ctx),
        }),
      }),
      categorySelectMenu,
      ...textComponents,
      createSeparator(true),
      selectMenu,
    ],
  });

  ctx.makeLayoutMessage({
    components: [container],
  });
};

export { buySeeds, handleBuySeedsInteractions, getBuySeedsComponents };
