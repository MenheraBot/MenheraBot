import { ButtonComponent, ButtonStyles, DiscordEmbedField, SelectOption } from 'discordeno/types';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { AvailablePlants, Plantation, PlantationState, PlantedField } from './types';
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

const PlantIcon: Record<AvailablePlants | PlantationState, string> = {
  EMPTY: '🟫',
  GROWING: '🌱',
  ROTTEN: '🍂',
  MATURE: '',
  [AvailablePlants.Mate]: '🌿',
};

const getPlantationDisplay = (state: PlantationState, field: Plantation): string => {
  const repeatIcon = (icon: string) =>
    `${icon}${icon}${icon}\n${icon}${icon}${icon}\n${icon}${icon}${icon}`;

  if (state === 'MATURE') return repeatIcon(PlantIcon[(field as PlantedField).plantType]);

  return repeatIcon(PlantIcon[state]);
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
    let fieldText = getPlantationDisplay(plantState, field);

    if (field.isPlanted) {
      switch (plantState) {
        case 'GROWING': {
          fieldText += `\nMaduro \n<t:${millisToSeconds(timeToAction)}:R>`;
          break;
        }
        case 'ROTTEN': {
          fieldText += `\nApodrecido \n<t:${millisToSeconds(timeToAction)}:R>`;
          break;
        }
        case 'MATURE': {
          fieldText += `\nApodrecerá \n<t:${millisToSeconds(timeToAction)}:R>`;
          break;
        }
      }
    }

    fields.push({
      name: `Campo (${i + 1})`,
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
        label: `${field.isPlanted ? 'Colher' : 'Plantar'} (${i + 1})`,
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
        label: `NOME ${seed.plant} ${seed.amount}x`,
        emoji: { name: PlantIcon[seed.plant] },
        value: `${seed.plant}`,
        default: selectedSeed === seed.plant,
      });

      return allSeeds;
    },
    [
      {
        label: 'Erva ∞',
        emoji: { name: PlantIcon[AvailablePlants.Mate] },
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

  const embed = createEmbed({
    title: `Fazenda de ${getDisplayName(ctx.user)}`,
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
