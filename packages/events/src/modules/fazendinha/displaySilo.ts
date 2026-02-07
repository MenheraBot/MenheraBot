import {
  ActionRow,
  ButtonStyles,
  MessageFlags,
  SectionComponent,
  SeparatorComponent,
  StringSelectComponent,
  TextDisplayComponent,
  TextStyles,
} from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { AvailablePlants, PlantQuality } from './types.js';
import { Items, Plants } from './constants.js';
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
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction.js';
import { executeSellPlant, receiveModal } from '../shop/sellPlants.js';
import { InteractionContext } from '../../types/menhera.js';
import {
  filterPlant,
  filterPlantsByQuality,
  getQuality,
  getQualityEmoji,
  getSiloLimits,
  groupPlantsByType,
  isMatePlant,
} from './siloUtils.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';

const displaySilo = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const user =
    `${ctx.user.id}` !== farmer.id ? await cacheRepository.getDiscordUser(farmer.id) : ctx.user;

  const items = farmer.seeds.filter((a) => a.amount > 0);

  const hasMateSeed = items.some((i) => isMatePlant(i.plant));
  if (!hasMateSeed) items.push({ amount: 0, plant: AvailablePlants.Mate });

  const groupedPlants = groupPlantsByType(farmer.silo);
  const entries = Object.entries(groupedPlants);

  const maySell = entries.length > 0;

  const fields: (TextDisplayComponent | SectionComponent | SeparatorComponent)[] = [];

  fields.push(
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

  fields.push(
    createSeparator(),
    createTextDisplay(
      `### ${ctx.locale(`commands:fazendinha.plantations.seeds`)}\n${
        items.filter((a) => a.amount > 0).length === 0
          ? `_${ctx.locale('commands:fazendinha.silo.nothing')}_`
          : items
              .flatMap((a) =>
                a.amount > 0
                  ? [
                      ctx.locale(
                        `commands:fazendinha.silo.display-${isMatePlant(a.plant) ? 'mate' : 'other'}`,
                        {
                          emoji: Plants[a.plant].emoji,
                          amount: a.amount,
                          metric: 'x',
                          plant: ctx.locale(`data:plants.${a.plant}`),
                          quality: '',
                        },
                      ),
                    ]
                  : [],
              )
              .join('\n')
      }`,
    ),
    createSeparator(),
    createSection({
      accessory: createButton({
        label: ctx.locale('commands:fazendinha.silo.use-items'),
        style: ButtonStyles.Primary,
        customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'ADMIN'),
        disabled:
          farmer.id !== `${ctx.user.id}` ||
          farmer.items.length === 0 ||
          farmer.items.every((i) => i.amount <= 0),
      }),
      components: [
        createTextDisplay(`### ${ctx.locale('commands:fazendinha.silo.items')}`),
        createTextDisplay(
          farmer.items.length === 0
            ? `_${ctx.locale('commands:fazendinha.silo.nothing')}_`
            : farmer.items
                .flatMap((item) =>
                  item.amount > 0
                    ? [
                        ctx.locale('commands:fazendinha.silo.display-other', {
                          emoji: Items[item.id].emoji,
                          amount: item.amount,
                          metric: 'x',
                          quality: '',
                          plant: ctx.locale(`data:farm-items.${item.id}`),
                        }),
                      ]
                    : [],
                )
                .join('\n'),
        ),
      ],
    }),
  );

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        components: [
          createTextDisplay(
            `## ${ctx.locale('commands:fazendinha.silo.embed-title', {
              user: getDisplayName(user ?? ctx.user),
            })}`,
          ),
        ],
        accessory: createButton({
          label: ctx.locale('commands:fazendinha.silo.sell-plants'),
          style: maySell ? ButtonStyles.Success : ButtonStyles.Secondary,
          disabled: farmer.id !== `${ctx.user.id}` || !maySell,
          customId: createCustomId(
            8,
            ctx.user.id,
            ctx.originalInteractionId,
            'DISPLAY',
            embedColor,
          ),
        }),
      }),
      ...fields,
      createSeparator(),
      createTextDisplay(
        `-# ${ctx.locale('commands:fazendinha.silo.footer', { ...getSiloLimits(farmer) })}`,
      ),
    ],
  });

  ctx.makeLayoutMessage({
    components: [container],
  });
};

const handleButtonAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption, embedColor, confirm, selectedQuality] = ctx.sentData;

  const sentQuality = selectedQuality ? Number(selectedQuality) : undefined;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (selectedOption === 'DISPLAY')
    return buildSellPlantsMessage(ctx, farmer, embedColor, sentQuality);

  if (selectedOption === 'SET_QUALITY') {
    const selectedOption = Number(ctx.interaction.data.values?.[0]) || 0;

    return buildSellPlantsMessage(ctx, farmer, embedColor, selectedOption);
  }

  if (selectedOption === 'SHOW_MODAL') {
    const sellAll = ctx.interaction.data.values?.some((a) => a.includes('ALL'));

    const [, , , quality] = ctx.sentData;

    if (!sellAll)
      return showModal(
        ctx as ComponentInteractionContext<SelectMenuInteraction>,
        farmer,
        embedColor,
        sentQuality,
      );

    const byQuality = filterPlantsByQuality(farmer.silo);

    return executeSellPlant(ctx, farmer, byQuality[Number(quality) as PlantQuality], sentQuality);
  }

  if (selectedOption === 'SELL_ALL') {
    const confirmed = confirm === 'true';

    if (confirmed) return executeSellPlant(ctx, farmer, farmer.silo);

    return buildSellPlantsMessage(ctx, farmer, embedColor, sentQuality, true);
  }

  if (selectedOption === 'SELL')
    return receiveModal(ctx as ComponentInteractionContext<ModalInteraction>, farmer, sentQuality);
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
            plant: ctx.locale(`data:plants.${plant as '0'}`),
            amount: fromSilo.weight,
          }),
          customId: `${plant}|${quality}`,
          style: TextStyles.Short,
          minLength: 1,
          maxLength: `${fromSilo.weight}`.length,
          required: true,
          placeholder: ctx.locale('commands:fazendinha.silo.select', {
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

  ctx.respondWithModal({
    customId: createCustomId(
      8,
      ctx.user.id,
      ctx.originalInteractionId,
      'SELL',
      embedColor,
      ctx.sentData[2],
      selectedQuality,
    ),
    title: ctx.locale('commands:fazendinha.silo.sell-plants'),
    components: modalFields,
  });
};

const buildSellPlantsMessage = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  selectedQuality?: PlantQuality,
  confirm = false,
): Promise<void> => {
  const availableQualities = farmer.silo.reduce<Partial<Record<PlantQuality, true>>>((p, c) => {
    if ((c.weight ?? c.amount ?? 0) < 0) return p;

    const quality = getQuality(c);

    if (p[quality]) return p;

    p[quality] = true;

    return p;
  }, {});

  const qualityArray = Object.keys(availableQualities).reverse();

  if (qualityArray.length === 0)
    return ctx.makeLayoutMessage({
      flags: MessageFlags.Ephemeral,
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:fazendinha.silo.no-plants')),
      ],
    });

  const components: [ActionRow, ...(SeparatorComponent | TextDisplayComponent)[]] = [
    createActionRow([
      createSelectMenu({
        customId: createCustomId(
          8,
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
            label: ctx.locale('commands:fazendinha.silo.sell-plant', {
              plant: ctx.locale(`data:plants.${p.plant}`),
            }),
            emoji: { name: Plants[p.plant].emoji },
            value: `${p.plant}|${realSelectedQuality}|N`,
          },
        ]
      : [],
  );

  if (plantOptions.length < 25)
    plantOptions.unshift({
      label: ctx.locale('commands:fazendinha.silo.sell-all-plants', {
        quality: ctx
          .locale(`commands:fazendinha.silo.quality-plants-${realSelectedQuality}`)
          .toLowerCase(),
      }),
      value: `ALL|${realSelectedQuality}`,
      emoji: { name: '💰' },
    });

  components.push(
    createActionRow([
      createSelectMenu({
        options: plantOptions,
        minValues: 1,
        maxValues: plantOptions.length >= 5 ? 5 : plantOptions.length,
        placeholder: `${getQualityEmoji(realSelectedQuality)} ${ctx.locale('commands:fazendinha.silo.choose-sell')}`,
        customId: createCustomId(
          8,
          ctx.user.id,
          ctx.originalInteractionId,
          'SHOW_MODAL',
          embedColor,
          false,
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
        components: [
          createTextDisplay(
            `## ${ctx.locale(`commands:fazendinha.silo.${confirm ? 'confirm-title' : 'sell-title'}`)}\n-# ${ctx.locale(
              'commands:fazendinha.silo.footer',
              { ...getSiloLimits(farmer) },
            )}`,
          ),
        ],
        accessory: createButton({
          style: confirm ? ButtonStyles.Danger : ButtonStyles.Primary,
          label: ctx.locale(`commands:fazendinha.silo.${confirm ? 'confirm-' : ''}sell-all`),
          customId: createCustomId(
            8,
            ctx.user.id,
            ctx.originalInteractionId,
            'SELL_ALL',
            embedColor,
            confirm,
            selectedQuality,
          ),
        }),
      }),
      ...components,
    ],
  });

  ctx.makeLayoutMessage({
    components: [container],
  });
};

export { displaySilo, handleButtonAction, buildSellPlantsMessage };
