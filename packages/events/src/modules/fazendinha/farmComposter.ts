import {
  ActionRow,
  ButtonStyles,
  MessageComponentTypes,
  MessageFlags,
  SeparatorComponent,
  StringSelectComponent,
  TextDisplayComponent,
  TextStyles,
} from '@discordeno/bot';
import { InteractionContext } from '../../types/menhera.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database.js';
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
} from '../../utils/discord/componentUtils.js';
import { PlantStateIcon } from './displayPlantations.js';
import { COMPOSTER_FERTILIZER_YIELD, Items, MAX_COMPOSTER_VALUE, Plants } from './constants.js';
import { AvailableItems, PlantationState, PlantQuality } from './types.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  extractNameAndIdFromEmoji,
  setComponentsV2Flag,
} from '../../utils/discord/messageUtils.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import {
  addItems,
  filterPlant,
  getQuality,
  getQualityEmoji,
  getSiloLimits,
  groupPlantsByType,
} from './siloUtils.js';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction.js';
import { extractFields } from '../../utils/discord/modalUtils.js';

const displaySelectComposterPlants = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  selectedQuality?: PlantQuality,
) => {
  const availableQualities = farmer.silo.reduce<Partial<Record<PlantQuality, true>>>((p, c) => {
    if ((c.weight ?? 0) <= 0) return p;

    const quality = getQuality(c);

    if (p[quality]) return p;

    p[quality] = true;

    return p;
  }, {});

  const qualityArray = Object.keys(availableQualities).reverse();

  if (qualityArray.length === 0)
    return ctx.respondInteraction({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:fazendinha.composteira.no-plants')),
      ],
    });

  const components: [ActionRow, ...(SeparatorComponent | TextDisplayComponent)[]] = [
    createActionRow([
      createSelectMenu({
        customId: createCustomId(
          10,
          ctx.user.id,
          ctx.originalInteractionId,
          'SET_QUALITY',
          embedColor,
        ),
        options: qualityArray.map((q) => {
          const quality = Number(q) as PlantQuality;
          return {
            label: ctx.locale(`data:fazendinha.quality_${quality}`),
            value: q,
            default: selectedQuality === quality,
            emoji: { name: getQualityEmoji(quality) },
          };
        }),
      }),
    ]),
  ];

  if ((components[0].components[0] as StringSelectComponent).options.every((a) => !a.default)) {
    (components[0].components[0] as StringSelectComponent).options[0].default = true;
  }

  const realStringSelectedQuality = (
    components[0].components[0] as StringSelectComponent
  ).options.find((a) => a.default)?.value;

  const realSelectedQuality = getQuality({
    quality: realStringSelectedQuality ? Number(realStringSelectedQuality) : undefined,
  });

  const plantOptions = farmer.silo.flatMap((p) =>
    getQuality(p) === realSelectedQuality
      ? [
          {
            label: ctx.locale('commands:fazendinha.composteira.transform-plant', {
              plant: ctx.locale(`data:plants.${p.plant}`),
            }),
            emoji: { name: Plants[p.plant].emoji },
            value: `${p.plant}|${realSelectedQuality}|N`,
          },
        ]
      : [],
  );

  components.push(
    createActionRow([
      createSelectMenu({
        options: plantOptions,
        minValues: 1,
        maxValues: plantOptions.length >= 5 ? 5 : plantOptions.length,
        placeholder: `${getQualityEmoji(realSelectedQuality)} ${ctx.locale('commands:fazendinha.composteira.choose-plant')}`,
        customId: createCustomId(
          10,
          ctx.user.id,
          ctx.originalInteractionId,
          'SHOW_MODAL',
          embedColor,
          realSelectedQuality,
        ),
      }),
    ]),
  );

  const groupedPlants = groupPlantsByType(farmer.silo);
  const entries = Object.entries(groupedPlants);

  components.push(
    createSeparator(),
    createTextDisplay(
      `### ${ctx.locale(`commands:fazendinha.silo.quality-plants`)}\n${
        entries.length === 0
          ? `_${ctx.locale('commands:fazendinha.silo.nothing')}_`
          : `- ${entries
              .map(
                ([plantId, plants]) =>
                  `${Plants[Number(plantId) as 1].emoji} - ${plants.map((p) => `${getQualityEmoji(getQuality(p))} **${p.weight} Kg**`).join(', ')}`,
              )
              .join('\n- ')}`
      }`,
    ),
  );

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        accessory: createButton({
          style: ButtonStyles.Secondary,
          customId: createCustomId(
            10,
            ctx.user.id,
            ctx.originalInteractionId,
            'BACK',
            embedColor,
            selectedQuality,
          ),
          label: ctx.locale('common:goback'),
        }),
        components: [
          createTextDisplay(
            `## ${ctx.prettyResponse('composter', 'commands:fazendinha.composteira.transform')}\n-# ${ctx.locale(
              'commands:fazendinha.silo.footer',
              { ...getSiloLimits(farmer) },
            )}`,
          ),
        ],
      }),
      ...components,
    ],
  });

  await ctx.makeLayoutMessage({
    components: [container],
  });
};

const respondInvalidAmount = (ctx: ComponentInteractionContext) =>
  ctx.respondInteraction({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('error', 'commands:fazendinha.composteira.invalid-amount'),
      ),
    ],
  });

const receiveModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  farmer: DatabaseFarmerSchema,
  selectedColor: string,
  selectedQuality?: PlantQuality,
): Promise<void> => {
  const selectedPlants: QuantitativePlant[] = extractFields(ctx.interaction).map((a) => {
    const [plant, quality] = a.customId.split('|');

    return {
      weight: parseFloat(Number(a.value.replace(',', '.')).toFixed(1)),
      plant: Number(plant),
      quality: Number(quality),
    };
  });

  for (let i = selectedPlants.length - 1; i >= 0; i--) {
    const currentPlant = selectedPlants[i];

    if (Number.isNaN(currentPlant.weight)) return respondInvalidAmount(ctx);

    if (currentPlant.weight <= 0) return respondInvalidAmount(ctx);

    const fromSilo = farmer.silo.find(filterPlant(currentPlant));

    if (!fromSilo || fromSilo.weight < currentPlant.weight) {
      const updatedFarmer = await farmerRepository.getFarmer(farmer.id);

      await displaySelectComposterPlants(ctx, updatedFarmer, selectedColor, selectedQuality);

      return ctx.followUp({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.composteira.not-enough', {
              amount: currentPlant.weight,
              plant: `${getQualityEmoji(getQuality(currentPlant))} ${ctx.locale(`data:plants.${currentPlant.plant}`)}`,
            }),
          ),
        ],
      });
    }

    if (currentPlant.weight <= 0) return respondInvalidAmount(ctx);

    fromSilo.weight = parseFloat((fromSilo.weight - currentPlant.weight).toFixed(1));
    if (fromSilo.weight <= 0) farmer.silo.splice(farmer.silo.findIndex(filterPlant(fromSilo)), 1);

    const toComposte = composterEquivalentForField(currentPlant, PlantationState.Mature);
    farmer.composter += toComposte;
  }

  farmer.composter = Math.min(farmer.composter, MAX_COMPOSTER_VALUE);

  await farmerRepository.updateSilo(ctx.user.id, farmer.silo, farmer.composter);

  await displayComposter(ctx, farmer, selectedColor);
};

const showModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  selectedQuality?: PlantQuality,
): Promise<void> => {
  const selectedOptions = ctx.interaction.data.values;

  const modalFields = selectedOptions.reduce<ActionRow[]>((fields, plantId) => {
    const [plant, quality] = plantId.split('|');
    const fromSilo = farmer.silo.find(
      filterPlant({ plant: Number(plant), quality: Number(quality) }),
    );

    if (!fromSilo) return fields;

    fields.push(
      createActionRow([
        createTextInput({
          label: ctx.locale('commands:fazendinha.silo.max', {
            plant: `${ctx.locale(`data:plants.${plant as '0'}`)} ${getQualityEmoji(Number(quality))}`,
            emoji: Plants[plant as '1'].emoji,
            amount: fromSilo.weight,
          }),
          customId: `${plant}|${quality}`,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: Math.max(`${fromSilo.weight}`.length, 3),
          required: true,
          placeholder: ctx.locale('commands:fazendinha.composteira.select', {
            plant: ctx.locale(`data:plants.${plant as '0'}`),
          }),
        }),
      ]),
    );

    return fields;
  }, []);

  if (modalFields.length === 0)
    return ctx.makeLayoutMessage({
      components: [createTextDisplay(ctx.locale('commands:fazendinha.silo.not-enough-plants'))],
    });

  await ctx.respondWithModal({
    customId: createCustomId(
      10,
      ctx.user.id,
      ctx.originalInteractionId,
      'COMPOSTE',
      embedColor,
      selectedQuality,
    ),
    title: ctx.locale('commands:fazendinha.composteira.transform'),
    components: modalFields,
  });
};

const handleComposterInteractions = async (ctx: ComponentInteractionContext) => {
  const [action, embedColor, quality] = ctx.sentData;

  const sentQuality = Number(quality);

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (action === 'ADD_PLANTS')
    return displaySelectComposterPlants(ctx, farmer, embedColor, sentQuality);

  if (action === 'BACK') return displayComposter(ctx, farmer, embedColor);

  if (action === 'COMPOSTE')
    return receiveModal(
      ctx as ComponentInteractionContext<ModalInteraction>,
      farmer,
      embedColor,
      sentQuality,
    );

  if (action === 'SET_QUALITY') {
    const selectedOption = Number(ctx.interaction.data.values?.[0]) || 0;

    return displaySelectComposterPlants(ctx, farmer, embedColor, selectedOption);
  }

  if (action === 'SHOW_MODAL')
    return showModal(
      ctx as ComponentInteractionContext<SelectMenuInteraction>,
      farmer,
      embedColor,
      sentQuality,
    );

  if (action === 'GET_FERTILIZER') {
    if (farmer.composter < MAX_COMPOSTER_VALUE)
      return ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.composteira.composter-not-full'),
          ),
        ],
      });

    const siloLimits = getSiloLimits(farmer);

    if (siloLimits.used + COMPOSTER_FERTILIZER_YIELD > siloLimits.limit)
      return ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.composteira.silo-full'),
          ),
        ],
      });

    await farmerRepository.executeComposter(
      ctx.user.id,
      addItems(farmer.items, [
        { amount: COMPOSTER_FERTILIZER_YIELD, id: AvailableItems.Fertilizer },
      ]),
      0,
    );

    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(
          ctx.prettyResponse('success', 'commands:fazendinha.composteira.success', {
            emoji: Items[AvailableItems.Fertilizer].emoji,
            amount: COMPOSTER_FERTILIZER_YIELD,
          }),
        ),
      ],
    });
  }
};

const displayComposter = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
) => {
  const total = 23;
  const percent = farmer.composter / MAX_COMPOSTER_VALUE;
  const filled = Math.round(total * percent);
  const progressBar = `[${'█'.repeat(filled) + '░'.repeat(total - filled)}]`;

  const havePlants = farmer.silo.some((a) => a.weight > 0);

  await ctx.makeLayoutMessage({
    components: [
      {
        accentColor: hexStringToNumber(embedColor),
        type: MessageComponentTypes.Container,
        components: [
          createTextDisplay(
            `## ${ctx.prettyResponse('composter', 'commands:fazendinha.composteira.title')}\n${ctx.locale(
              'commands:fazendinha.composteira.description',
              { percent: Math.floor(percent * 100) },
            )}`,
          ),
          createTextDisplay(`### ${progressBar}`),
          createActionRow([
            createButton({
              style: ButtonStyles.Primary,
              customId: createCustomId(
                10,
                ctx.user.id,
                ctx.originalInteractionId,
                'ADD_PLANTS',
                embedColor,
              ),
              disabled: !havePlants || percent >= 1,
              emoji: { name: PlantStateIcon.GROWING },
              label: ctx.locale('commands:fazendinha.composteira.add-plants'),
            }),
            createButton({
              style: ButtonStyles.Success,
              customId: createCustomId(
                10,
                ctx.user.id,
                ctx.originalInteractionId,
                'GET_FERTILIZER',
                embedColor,
              ),
              emoji: extractNameAndIdFromEmoji(Items[AvailableItems.Fertilizer].emoji),
              disabled: percent < 1,
              label: ctx.locale('commands:fazendinha.composteira.get-fertilizer'),
            }),
          ]),
        ],
      },
    ],
  });
};

const composterEquivalentForField = (
  field: QuantitativePlant,
  plantState: PlantationState,
): number => {
  if (plantState === PlantationState.Growing) return 0;

  const quality = getQuality(field);
  const value = 2 + field.plant + quality;
  const baseAmount = value * (field.weight || 1);

  if (plantState === PlantationState.Rotten) return Math.floor(baseAmount + 15 + (quality + 1) * 7);

  return Math.floor(baseAmount);
};

export { displayComposter, handleComposterInteractions, composterEquivalentForField };
