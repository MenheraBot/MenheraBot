import {
  ButtonStyles,
  MessageComponentTypes,
  SectionComponent,
  SelectOption,
  SeparatorComponent,
} from '@discordeno/bot';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils.js';
import { AvailablePlants, Plantation, PlantationState, PlantedField, Seasons } from './types.js';
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
} from '../../utils/discord/componentUtils.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { getPlantationState } from './plantationState.js';
import { Items, Plants } from './constants.js';
import { getSeasonalInfo } from './seasonsManager.js';
import { getQuality, getQualityEmoji, isMatePlant } from './siloUtils.js';

const PlantStateIcon: Record<PlantationState, string> = {
  [PlantationState.Empty]: '🟫',
  [PlantationState.Growing]: '🌱',
  [PlantationState.Rotten]: '🍂',
  [PlantationState.Mature]: '',
};

const SeasonEmojis: Record<Seasons, string> = {
  [Seasons.Autumn]: '🍁',
  [Seasons.Winter]: '❄️',
  [Seasons.Spring]: '🍃',
  [Seasons.Summer]: '☀️',
};

const ButtonStyleForPlantState: Record<PlantationState, ButtonStyles> = {
  [PlantationState.Empty]: ButtonStyles.Primary,
  [PlantationState.Growing]: ButtonStyles.Danger,
  [PlantationState.Mature]: ButtonStyles.Success,
  [PlantationState.Rotten]: ButtonStyles.Secondary,
};

const repeatIcon = (icon: string): string => `\n${icon.repeat(3)}`.repeat(3);

const getPlantationDisplay = (
  ctx: InteractionContext,
  state: PlantationState,
  timeToAction: number,
  field: Plantation,
): string => {
  const toUseEmoji =
    state === PlantationState.Mature
      ? Plants[(field as PlantedField).plantType].emoji
      : PlantStateIcon[state];

  const unix = millisToSeconds(timeToAction);

  return ctx.locale('commands:fazendinha.plant-states-message.message', {
    unix: field.isPlanted ? `<t:${unix}:R>\n<t:${unix}:d> <t:${unix}:T>` : undefined,
    emojis: repeatIcon(toUseEmoji),
    state: ctx.locale(`commands:fazendinha.plant-states-message.${state}`),
  });
};

const parseUserPlantations = (
  ctx: InteractionContext,
  plantations: Plantation[],
  embedColor: string,
  selectedSeed: AvailablePlants,
  forceField: number,
): (SectionComponent | SeparatorComponent)[] => {
  const fieldsComponents: (SectionComponent | SeparatorComponent)[] = [];

  plantations.forEach((field, i) => {
    const [plantState, timeToAction] = getPlantationState(field);
    const fieldText = getPlantationDisplay(ctx, plantState, timeToAction, field);

    const upgrades = field.upgrades ?? [];

    const prependTitle = upgrades.reduce<string>((text, upgrade) => {
      if (upgrade.expiresAt <= Date.now()) return text;

      return `${text}${Items[upgrade.id].emoji}`;
    }, '');

    fieldsComponents.push(
      createSeparator(false),
      createSection({
        components: [
          createTextDisplay(
            `**${ctx.locale('commands:fazendinha.plantations.field', {
              index: i + 1,
              emojis: prependTitle,
            })}**`,
          ),
          createTextDisplay(fieldText),
        ],
        accessory: createButton({
          label: ctx.locale(
            `commands:fazendinha.plantations.${
              {
                [PlantationState.Mature]: 'harvest' as const,
                [PlantationState.Rotten]: 'collect' as const,
                [PlantationState.Growing]: 'discart' as const,
                [PlantationState.Empty]: 'plant' as const,
              }[plantState]
            }`,
          ),
          emoji:
            plantState === PlantationState.Empty
              ? { name: Plants[selectedSeed].emoji }
              : { name: Plants[(field as PlantedField).plantType].emoji },
          style: ButtonStyleForPlantState[plantState],
          customId: createCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            `${i}`,
            embedColor,
            `${selectedSeed}`,
            forceField === i ? 'Y' : 'N',
          ),
        }),
      }),
    );
  });

  return fieldsComponents;
};

const getAvailableSeeds = (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  selectedSeed: AvailablePlants,
  currentSeason: Seasons,
): SelectOption[] =>
  farmer.seeds.reduce<SelectOption[]>(
    (allSeeds, seed) => {
      if (seed.amount <= 0 || isMatePlant(seed.plant)) return allSeeds;

      const plant = Plants[seed.plant];

      const includeDescription = [plant.bestSeason, plant.worstSeason].includes(currentSeason);

      allSeeds.push({
        label: ctx.locale('commands:fazendinha.plantations.available-seed', {
          name: ctx.locale(`data:plants.${seed.plant}`),
          amount: seed.amount,
        }),
        description:
          (includeDescription
            ? ctx.locale(
                `commands:fazendinha.plantations.season-boost-${
                  plant.bestSeason === currentSeason
                }`,
              )
            : ''
          ).slice(0, 99) || undefined,
        emoji: { name: plant.emoji },
        value: `${seed.plant}`,
        default: selectedSeed === seed.plant,
      });

      return allSeeds;
    },
    [
      {
        label: `${ctx.locale('data:plants.0')} ∞`,
        emoji: { name: Plants[AvailablePlants.Mate].emoji },
        value: `${AvailablePlants.Mate}`,
        description: [
          Plants[AvailablePlants.Mate].bestSeason,
          Plants[AvailablePlants.Mate].worstSeason,
        ].includes(currentSeason)
          ? ctx.locale(
              `commands:fazendinha.plantations.season-boost-${
                Plants[AvailablePlants.Mate].bestSeason === currentSeason
              }`,
            )
          : undefined,
        default: selectedSeed === AvailablePlants.Mate,
      },
    ],
  );

const displayPlantations = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  selectedSeed: AvailablePlants,
  forceField: number,
  harvested?: QuantitativePlant[],
): Promise<void> => {
  const fields = parseUserPlantations(
    ctx,
    farmer.plantations,
    embedColor,
    selectedSeed,
    forceField,
  );

  const seasonalInfo = await getSeasonalInfo();

  const seeds = getAvailableSeeds(ctx, farmer, selectedSeed, seasonalInfo.currentSeason);

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createSection({
        components: [
          createTextDisplay(
            `### ${ctx.locale('commands:fazendinha.plantations.embed-title', {
              user: getDisplayName(ctx.user),
            })}`,
          ),
          createTextDisplay(
            ctx.locale('commands:fazendinha.plantations.description', {
              season: ctx.locale(`commands:fazendinha.seasons.${seasonalInfo.currentSeason}`),
              unix: millisToSeconds(seasonalInfo.endsAt),
              emoji: SeasonEmojis[seasonalInfo.currentSeason],
            }),
          ),
        ],
        accessory: {
          type: MessageComponentTypes.Thumbnail,
          media: { url: getUserAvatar(ctx.user, { enableGif: true }) },
        },
      }),
      ...fields,
    ],
  });

  if (harvested && harvested.length > 0) {
    const summedWeights = harvested.reduce<Record<string, number>>((p, c) => {
      const quality = getQuality(c);
      const key = `${c.plant}|${quality}` as const;

      if (p[key]) p[key] += c.weight;
      else p[key] = c.weight;

      return p;
    }, {});

    const plantsTransformed = Object.entries(summedWeights).map<QuantitativePlant>(
      ([plantQuality, weight]) => {
        const [plant, quality] = plantQuality.split('|');

        return {
          plant: Number(plant),
          quality: Number(quality),
          weight: parseFloat(weight.toFixed(1)),
        };
      },
    );

    container.components.push(
      createSeparator(true),
      createTextDisplay(
        `${ctx.locale('commands:fazendinha.plantations.harvest-text', {
          harvested: plantsTransformed
            .map(
              (plant) =>
                `- ${getQualityEmoji(getQuality(plant))}${Plants[plant.plant].emoji} **${plant.weight} kg**`,
            )
            .join('\n'),
        })}`,
      ),
    );
  }

  const canPlant = farmer.plantations.some((a) => !a.isPlanted);
  const canHarvest = farmer.plantations.some(
    (a) => getPlantationState(a)[0] === PlantationState.Mature,
  );

  const controllerContainer = createContainer({
    components: [
      createTextDisplay(ctx.locale('commands:fazendinha.plantations.select-seed')),
      createActionRow([
        createSelectMenu({
          customId: createCustomId(1, ctx.user.id, ctx.originalInteractionId, embedColor),
          options: seeds,
          maxValues: 1,
          minValues: 1,
        }),
      ]),
      createSeparator(false, false),
      createActionRow([
        createButton({
          label: ctx.locale('commands:fazendinha.plantations.plant-all'),
          style: canPlant ? ButtonStyles.Primary : ButtonStyles.Secondary,
          customId: createCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            `PLANT_ALL`,
            embedColor,
            `${selectedSeed}`,
            'N',
          ),
          disabled: !canPlant,
        }),
        createButton({
          label: ctx.locale('commands:fazendinha.plantations.harvest-all'),
          style: canHarvest ? ButtonStyles.Success : ButtonStyles.Secondary,
          customId: createCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            `HARVEST_ALL`,
            embedColor,
            `${selectedSeed}`,
            'N',
          ),
          disabled: !canHarvest,
        }),
      ]),
      createTextDisplay(`-# ${ctx.locale('commands:fazendinha.plantations.explain-all-action')}`),
    ],
  });

  await ctx.makeLayoutMessage({
    components: [container, controllerContainer],
  });
};

export { displayPlantations, repeatIcon, PlantStateIcon, SeasonEmojis };
