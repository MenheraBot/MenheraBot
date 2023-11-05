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
import { Plants } from './plants';
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

const getPlantationDisplay = (
  ctx: InteractionContext,
  state: PlantationState,
  timeToAction: number,
  field: Plantation,
): string => {
  const repeatIcon = (icon: string) =>
    `${icon}${icon}${icon}\n${icon}${icon}${icon}\n${icon}${icon}${icon}`;

  const toUseEmoji =
    state === 'MATURE' ? Plants[(field as PlantedField).plantType].emoji : PlantStateIcon[state];

  return ctx.locale('commands:fazendinha.plant-states-message.message', {
    unix: field.isPlanted ? `<t:${millisToSeconds(timeToAction)}:R>` : undefined,
    emojis: repeatIcon(toUseEmoji),
    state: ctx.locale(`commands:fazendinha.plant-states-message.${state}`),
  });
};

const parseUserPlantations = (
  ctx: InteractionContext,
  plantations: Plantation[],
  embedColor: string,
  selectedSeed: AvailablePlants,
): [DiscordEmbedField[], ButtonComponent[]] => {
  const fields: DiscordEmbedField[] = [];
  const buttons: ButtonComponent[] = [];

  plantations.forEach((field, i) => {
    const [plantState, timeToAction] = getPlantationState(field);
    const fieldText = getPlantationDisplay(ctx, plantState, timeToAction, field);

    fields.push({
      name: ctx.locale('commands:fazendinha.plantations.field', { index: i + 1 }),
      value: fieldText,
      inline: true,
    });

    // eslint-disable-next-line no-nested-ternary
    const buttonStyle = !field.isPlanted
      ? ButtonStyles.Primary
      : plantState === 'MATURE'
      ? ButtonStyles.Success
      : ButtonStyles.Secondary;

    buttons.push(
      createButton({
        label: ctx.locale(`commands:fazendinha.plantations.field-action`, {
          index: i + 1,
          action: ctx.locale(
            `commands:fazendinha.plantations.${field.isPlanted ? 'harvest' : 'plant'}`,
          ),
        }),
        style: buttonStyle,
        disabled: plantState === 'GROWING',
        customId: createCustomId(
          0,
          ctx.user.id,
          ctx.commandId,
          `${i}`,
          embedColor,
          `${selectedSeed}`,
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
): SelectOption[] =>
  farmer.seeds.reduce(
    (allSeeds, seed) => {
      if (seed.amount <= 0 || seed.plant === AvailablePlants.Mate) return allSeeds;

      allSeeds.push({
        label: ctx.locale('commands:fazendinha.plantations.available-seed', {
          name: ctx.locale(`data:plants.${seed.plant}`),
          amount: seed.amount,
        }),
        emoji: { name: Plants[seed.plant].emoji },
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
        default: selectedSeed === AvailablePlants.Mate,
      },
    ],
  );

const displayPlantations = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
  selectedSeed: AvailablePlants,
): Promise<void> => {
  const [fields, buttons] = parseUserPlantations(ctx, farmer.plantations, embedColor, selectedSeed);

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
  });

  const actionRows = chunkArray(buttons, 3).map((a) => createActionRow(a as [ButtonComponent]));

  const seeds = getAvailableSeeds(ctx, farmer, selectedSeed);

  ctx.makeMessage({
    embeds: [embed],
    components: [
      createActionRow([
        createSelectMenu({
          customId: createCustomId(1, ctx.user.id, ctx.commandId, embedColor),
          options: seeds,
          maxValues: 1,
          minValues: 1,
        }),
      ]),
      ...actionRows,
    ],
  });
};

export { displayPlantations };
