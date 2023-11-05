import farmerRepository from '../../database/repositories/farmerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { SelectMenuInteraction } from '../../types/interaction';
import { postFazendinhaAction } from '../../utils/apiRequests/statistics';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { displayPlantations } from './displayPlantations';
import { getHarvestTime, getPlantationState } from './plantationState';
import { getCurrentSeason } from './seasonsManager';
import { AvailablePlants, PlantedField } from './types';

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

  const newField = {
    isPlanted: true as const,
    harvestAt,
    plantedSeason: currentSeason,
    plantedAt: 0,
    plantType: Number(seed),
  } satisfies PlantedField;

  farmer.plantations[selectedField] = newField;
  if (userSeeds && seed !== AvailablePlants.Mate) userSeeds.amount -= 1;

  await farmerRepository.executePlant(ctx.user.id, selectedField, newField, seed);

  displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
  );
};

const executeFieldAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const [selectedFieldString, embedColor, selectedSeedString] = ctx.sentData;
  const selectedField = Number(selectedFieldString);
  const seed = Number(selectedSeedString);

  const field = farmer.plantations[selectedField];

  const state = getPlantationState(field)[0];

  if (state === 'GROWING')
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:fazendinha.field-action.field-still-growing'),
      flags: MessageFlags.EPHEMERAL,
    });

  if (!field.isPlanted) return plantField(ctx, farmer, selectedField, seed, embedColor);

  farmer.plantations[selectedField] = { isPlanted: false };

  const updateStats = state === 'MATURE' && field.plantType === farmer.biggestSeed;

  await farmerRepository.executeHarvest(
    ctx.user.id,
    selectedField,
    { isPlanted: false },
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
  );

  const userSeeds = farmer.seeds.find((a) => a.plant === seed);

  postFazendinhaAction(
    `${ctx.user.id}`,
    field.plantType,
    state === 'ROTTEN' ? 'ROTTED' : 'HARVEST',
  );

  displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
  );
};

const changeSelectedSeed = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const [embedColor] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  displayPlantations(ctx, farmer, embedColor, Number(ctx.interaction.data.values[0]));
};

export { executeFieldAction, changeSelectedSeed };
