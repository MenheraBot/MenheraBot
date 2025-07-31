import { ButtonComponent, ButtonStyles, DiscordEmbedField, SelectOption } from 'discordeno/types';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { AvailablePlants, Plantation, PlantationState, PlantedField, Seasons } from './types';
import { DatabaseFarmerSchema } from '../../types/database';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils';
import { chunkArray, millisToSeconds } from '../../utils/miscUtils';
import { InteractionContext } from '../../types/menhera';
import { getPlantationState } from './plantationState';
import { Items, Plants } from './constants';
import { getSeasonalInfo } from './seasonsManager';

const PlantStateIcon: Record<PlantationState, string> = {
  EMPTY: '🟫',
  GROWING: '🌱',
  ROTTEN: '🍂',
  MATURE: '',
};

const SeasonEmojis: Record<Seasons, string> = {
  autumn: '🍁',
  winter: '❄️',
  spring: '🍃',
  summer: '☀️',
};

const ButtonStyleForPlantState: { [State in PlantationState]: ButtonStyles } = {
  EMPTY: ButtonStyles.Primary,
  GROWING: ButtonStyles.Danger,
  MATURE: ButtonStyles.Success,
  ROTTEN: ButtonStyles.Secondary,
};

const repeatIcon = (icon: string): string =>
  `${icon}${icon}${icon}\n${icon}${icon}${icon}\n${icon}${icon}${icon}`;

const getPlantationDisplay = (
  ctx: InteractionContext,
  state: PlantationState,
  timeToAction: number,
  field: Plantation,
): string => {
  const toUseEmoji =
    state === 'MATURE' ? Plants[(field as PlantedField).plantType].emoji : PlantStateIcon[state];

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
): [DiscordEmbedField[], ButtonComponent[]] => {
  const fields: DiscordEmbedField[] = [];
  const buttons: ButtonComponent[] = [];

  plantations.forEach((field, i) => {
    const [plantState, timeToAction] = getPlantationState(field);
    const fieldText = getPlantationDisplay(ctx, plantState, timeToAction, field);

    const upgrades = field.upgrades ?? [];

    const prependTitle = upgrades.reduce<string>((text, upgrade) => {
      if (upgrade.expiresAt <= Date.now()) return text;

      return `${text}${Items[upgrade.id].emoji}`;
    }, '');

    fields.push({
      name: ctx.locale('commands:fazendinha.plantations.field', {
        index: i + 1,
        emojis: prependTitle,
      }),
      value: fieldText,
      inline: true,
    });

    buttons.push(
      createButton({
        label: ctx.locale(`commands:fazendinha.plantations.field-action`, {
          index: i + 1,
          action: ctx.locale(
            `commands:fazendinha.plantations.${
              {
                MATURE: 'harvest' as const,
                ROTTEN: 'collect' as const,
                GROWING: 'discart' as const,
                EMPTY: 'plant' as const,
              }[plantState]
            }`,
          ),
        }),
        emoji:
          plantState === 'EMPTY'
            ? undefined
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
    );
  });

  return [fields, buttons];
};

const getAvailableSeeds = (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  selectedSeed: AvailablePlants,
  currentSeason: Seasons,
): SelectOption[] =>
  farmer.seeds.reduce<SelectOption[]>(
    (allSeeds, seed) => {
      if (seed.amount <= 0 || seed.plant === AvailablePlants.Mate) return allSeeds;

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
  harvestedWeight?: number,
): Promise<void> => {
  const [fields, buttons] = parseUserPlantations(
    ctx,
    farmer.plantations,
    embedColor,
    selectedSeed,
    forceField,
  );

  const seasonalInfo = await getSeasonalInfo();

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.plantations.embed-title', {
      user: getDisplayName(ctx.user),
    }),
    description: ctx.locale('commands:fazendinha.plantations.description', {
      season: ctx.locale(`commands:fazendinha.seasons.${seasonalInfo.currentSeason}`),
      unix: millisToSeconds(seasonalInfo.endsAt),
      emoji: SeasonEmojis[seasonalInfo.currentSeason],
    }),
    color: hexStringToNumber(embedColor),
    fields,
    footer: harvestedWeight
      ? {
          text: ctx.locale('commands:fazendinha.plantations.harvest-weight', {
            weight: harvestedWeight,
          }),
        }
      : undefined,
  });

  const actionRows = chunkArray(buttons, 3).map((a) => createActionRow(a as [ButtonComponent]));

  const seeds = getAvailableSeeds(ctx, farmer, selectedSeed, seasonalInfo.currentSeason);

  await ctx.makeMessage({
    embeds: [embed],
    components: [
      createActionRow([
        createSelectMenu({
          customId: createCustomId(1, ctx.user.id, ctx.originalInteractionId, embedColor),
          options: seeds,
          maxValues: 1,
          minValues: 1,
        }),
      ]),
      ...actionRows,
    ],
  });
};

export { displayPlantations, repeatIcon, PlantStateIcon, SeasonEmojis };
