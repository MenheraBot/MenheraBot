import farmerRepository from '../../database/repositories/farmerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { SelectMenuInteraction } from '../../types/interaction';
import { postFazendinhaAction } from '../../utils/apiRequests/statistics';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { displayPlantations } from './displayPlantations';
import { getFieldWeight, getHarvestTime, getPlantationState } from './plantationState';
import { Plants } from './constants';
import { getCurrentSeason } from './seasonsManager';
import { AvailablePlants, PlantedField } from './types';
import { getSiloLimits } from './siloUtils';

const plantField = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  selectedField: number,
  seed: AvailablePlants,
  embedColor: string,
) => {
  const userSeeds = farmer.seeds.find((a) => a.plant === seed);

  if (seed !== AvailablePlants.Mate && (!userSeeds || userSeeds.amount <= 0))
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.field-action.not-enough-seeds', {
        plant: ctx.locale(`data:plants.${userSeeds?.plant ?? 0}`),
      }),
      flags: MessageFlags.EPHEMERAL,
    });

  const currentSeason = await getCurrentSeason();

  const harvestAt = getHarvestTime(currentSeason, seed);

  const fieldUpgrades = farmer.plantations[selectedField].upgrades ?? [];

  const weight = getFieldWeight(seed, currentSeason, fieldUpgrades);

  const newField = {
    isPlanted: true as const,
    harvestAt,
    plantedSeason: currentSeason,
    plantType: Number(seed),
    weight,
    upgrades: fieldUpgrades,
  } satisfies PlantedField;

  farmer.plantations[selectedField] = newField;
  if (userSeeds && seed !== AvailablePlants.Mate) userSeeds.amount -= 1;

  await farmerRepository.executePlant(ctx.user.id, selectedField, newField, seed);

  displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
    -1,
  );
};

const executeFieldAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const [selectedFieldString, embedColor, selectedSeedString, force] = ctx.sentData;
  const selectedField = Number(selectedFieldString);
  const seed = Number(selectedSeedString);

  const field = farmer.plantations[selectedField];

  const state = getPlantationState(field)[0];

  const userSeeds = farmer.seeds.find((a) => a.plant === seed);

  if (state === 'GROWING' && force !== 'Y') {
    await displayPlantations(
      ctx,
      farmer,
      embedColor,
      !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
      selectedField,
    );

    return ctx.followUp({
      content: ctx.prettyResponse('warn', 'commands:fazendinha.field-action.imature-warning', {
        field: selectedField + 1,
        plant: ctx.locale(`data:plants.${(field as PlantedField).plantType}`),
        emoji: Plants[(field as PlantedField).plantType].emoji,
      }),
      flags: MessageFlags.EPHEMERAL,
    });
  }

  if (!field.isPlanted) return plantField(ctx, farmer, selectedField, seed, embedColor);

  const currentLimits = getSiloLimits(farmer);

  if (currentLimits.used + (field.weight ?? 1) >= currentLimits.limit)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
        limit: currentLimits.limit,
      }),
    });

  farmer.plantations[selectedField] = {
    isPlanted: false,
    upgrades: field.upgrades ?? [],
  };

  const updateStats =
    state === 'MATURE' &&
    field.plantType === farmer.biggestSeed &&
    farmer.biggestSeed < AvailablePlants.Mushroom;

  await farmerRepository.executeHarvest(
    ctx.user.id,
    selectedField,
    { isPlanted: false, upgrades: field.upgrades ?? [] },
    field.plantType,
    farmer.silo.some((a) => a.plant === field.plantType),
    state === 'MATURE',
    // eslint-disable-next-line no-nested-ternary
    updateStats
      ? farmer.plantedFields === 9
        ? 0
        : farmer.plantedFields + 1
      : farmer.plantedFields,
    updateStats && farmer.plantedFields === 9 ? farmer.biggestSeed + 1 : farmer.biggestSeed,
    field.weight ?? 1,
  );

  if (state !== 'GROWING')
    postFazendinhaAction(
      `${ctx.user.id}`,
      field.plantType,
      state === 'MATURE' ? 'HARVEST' : 'ROTTED',
    );

  displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
    -1,
  );
};

const changeSelectedSeed = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const [embedColor] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  displayPlantations(ctx, farmer, embedColor, Number(ctx.interaction.data.values[0]), -1);
};

export { executeFieldAction, changeSelectedSeed };
