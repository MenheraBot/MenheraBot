import {
  ActionRow,
  ButtonStyles,
  SelectOption,
  SeparatorComponent,
  SeparatorSpacingSize,
  TextDisplayComponent,
  TextStyles,
} from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
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
  getPlantPrice,
  getQuality,
  getQualityEmoji,
  getSiloLimits,
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

  const byQuality = filterPlantsByQuality(farmer.silo);

  let maySell = false;

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.silo.embed-title', {
      user: getDisplayName(user ?? ctx.user),
    }),
    color: hexStringToNumber(embedColor),
    fields: [
      ...Object.entries(byQuality).flatMap(([quality, plants]) => {
        const parsedQuality = Number(quality) as PlantQuality;
        const noPlants = plants.filter((a) => a.weight > 0).length === 0;

        if (!noPlants) maySell = true;

        return noPlants && parsedQuality !== PlantQuality.Normal
          ? []
          : [
              {
                name: ctx.locale(`commands:fazendinha.silo.quality-plants-${parsedQuality}`),
                value:
                  plants.length === 0
                    ? ctx.locale('commands:fazendinha.silo.nothing')
                    : plants
                        .flatMap((a) =>
                          a.weight > 0
                            ? [
                                ctx.locale(`commands:fazendinha.silo.display-other`, {
                                  emoji: Plants[a.plant].emoji,
                                  amount: a.weight,
                                  metric: ' kg',
                                  plant: ctx.locale(`data:plants.${a.plant}`),
                                  quality: getQualityEmoji(parsedQuality),
                                }),
                              ]
                            : [],
                        )
                        .join('\n'),
                inline: true,
              },
            ];
      }),
      {
        name: ctx.locale(`commands:fazendinha.plantations.seeds`),
        value:
          items.length === 0
            ? ctx.locale('commands:fazendinha.silo.nothing')
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
                .join('\n'),
        inline: true,
      },
      {
        name: ctx.locale('commands:fazendinha.silo.items'),
        value:
          farmer.items.length === 0
            ? ctx.locale('commands:fazendinha.silo.nothing')
            : farmer.items
                .flatMap((item) =>
                  item.amount > 0
                    ? [
                        ctx.locale('commands:fazendinha.silo.display-other', {
                          emoji: Items[item.id].emoji,
                          amount: item.amount,
                          metric: 'x',
                          plant: ctx.locale(`data:farm-items.${item.id}`),
                        }),
                      ]
                    : [],
                )
                .join('\n'),
        inline: true,
      },
    ],
    footer: { text: ctx.locale('commands:fazendinha.silo.footer', { ...getSiloLimits(farmer) }) },
  });

  const sellButton = createButton({
    label: ctx.locale('commands:fazendinha.silo.sell-plants'),
    style: maySell ? ButtonStyles.Success : ButtonStyles.Secondary,
    disabled: !maySell,
    customId: createCustomId(8, ctx.user.id, ctx.originalInteractionId, 'DISPLAY', embedColor),
  });

  const useItemsButton = createButton({
    label: ctx.locale('commands:fazendinha.silo.use-items'),
    style: ButtonStyles.Primary,
    customId: createCustomId(3, ctx.user.id, ctx.originalInteractionId, 'ADMIN', 0),
    disabled: farmer.items.length === 0 || farmer.items.every((i) => i.amount <= 0),
  });

  ctx.makeMessage({
    embeds: [embed],
    components:
      farmer.id === `${ctx.user.id}` ? [createActionRow([sellButton, useItemsButton])] : [],
  });
};

const handleButtonAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption, embedColor, confirm] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  if (selectedOption === 'DISPLAY') return buildSellPlantsMessage(ctx, farmer, embedColor);

  if (selectedOption === 'SHOW_MODAL') {
    const sellAll = ctx.interaction.data.values?.some((a) => a.includes('ALL'));

    const [, , quality] = ctx.sentData;

    if (!sellAll)
      return showModal(
        ctx as ComponentInteractionContext<SelectMenuInteraction>,
        farmer,
        embedColor,
      );

    const byQuality = filterPlantsByQuality(farmer.silo);

    return executeSellPlant(ctx, farmer, byQuality[Number(quality) as PlantQuality]);
  }

  if (selectedOption === 'SELL_ALL') {
    const confirmed = confirm === 'true';

    if (confirmed) return executeSellPlant(ctx, farmer, farmer.silo);

    return buildSellPlantsMessage(ctx, farmer, embedColor, true);
  }

  if (selectedOption === 'SELL')
    return receiveModal(ctx as ComponentInteractionContext<ModalInteraction>, farmer);
};

const showModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
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
    ),
    title: ctx.locale('commands:fazendinha.silo.sell-plants'),
    components: modalFields,
  });
};

const buildSellPlantsMessage = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  confirm = false,
): Promise<void> => {
  const normalOptions: SelectOption[] = [];
  const bestOptions: SelectOption[] = [];
  const worstOptions: SelectOption[] = [];

  const byQuality = filterPlantsByQuality(farmer.silo);

  const reduceFunction =
    (optionsToPush: SelectOption[]) => (text: string, plant: QuantitativePlant) => {
      if (plant.weight === 0) return text;
      if (optionsToPush.length >= 25) return text;

      optionsToPush.push({
        label: ctx.locale('commands:fazendinha.silo.sell-plant', {
          plant: ctx.locale(`data:plants.${plant.plant}`),
        }),
        emoji: { name: Plants[plant.plant].emoji },
        value: `${plant.plant}|${getQuality(plant)}|N`,
      });

      return ctx.locale('commands:fazendinha.silo.description', {
        text,
        emoji: Plants[plant.plant].emoji,
        amount: plant.weight,
        metric: ' kg',
        plant: ctx.locale(`data:plants.${plant.plant}`),
        value: getPlantPrice(plant),
      });
    };

  const bestDescription = byQuality[PlantQuality.Best].reduce(reduceFunction(bestOptions), '');
  const worstDescription = byQuality[PlantQuality.Worst].reduce(reduceFunction(worstOptions), '');
  const normalDescription = byQuality[PlantQuality.Normal].reduce(
    reduceFunction(normalOptions),
    '',
  );

  const selectComponents: (ActionRow | SeparatorComponent | TextDisplayComponent)[] = [];

  const pushFunction = (options: SelectOption[], quality: PlantQuality, description: string) => {
    if (options.length === 0) return;

    if (options.length < 25)
      options.unshift({
        label: ctx.locale('commands:fazendinha.silo.sell-all-plants', {
          quality: ctx.locale(`commands:fazendinha.silo.quality-plants-${quality}`).toLowerCase(),
        }),
        value: `ALL|${quality}`,
        emoji: { name: '💰' },
      });

    selectComponents.push(
      createSeparator({ divider: true, spacing: SeparatorSpacingSize.Large }),
      createTextDisplay(
        `### ${getQualityEmoji(quality)} ${ctx.locale(`commands:fazendinha.silo.quality-plants-${quality}`)}\n${description}`,
      ),
      createActionRow([
        createSelectMenu({
          options,
          minValues: 1,
          maxValues: options.length >= 5 ? 5 : options.length,
          placeholder: `${getQualityEmoji(quality)} ${ctx.locale('commands:fazendinha.silo.choose-sell')}`,
          customId: createCustomId(
            8,
            ctx.user.id,
            ctx.originalInteractionId,
            'SHOW_MODAL',
            embedColor,
            quality,
          ),
        }),
      ]),
    );
  };

  pushFunction(normalOptions, PlantQuality.Normal, normalDescription);
  pushFunction(bestOptions, PlantQuality.Best, bestDescription);
  pushFunction(worstOptions, PlantQuality.Worst, worstDescription);

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
          ),
        }),
      }),
      ...selectComponents,
    ],
  });

  if (normalOptions.length === 0 && bestOptions.length === 0 && worstDescription.length === 0) {
    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:fazendinha.silo.no-plants')),
      ],
    });
  }

  ctx.makeLayoutMessage({
    components: [container],
  });
};

export { displaySilo, handleButtonAction, buildSellPlantsMessage };
