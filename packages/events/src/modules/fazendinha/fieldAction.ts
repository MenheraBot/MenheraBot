import farmerRepository from '../../database/repositories/farmerRepository.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import { postFazendinhaAction } from '../../utils/apiRequests/statistics.js';
import { MessageFlags } from '@discordeno/bot';
import { displayPlantations } from './displayPlantations.js';
import { getFieldWeight, getHarvestTime, getPlantationState } from './plantationState.js';
import { Items, Plants } from './constants.js';
import { getCurrentSeason } from './seasonsManager.js';
import { AvailableItems, AvailablePlants, Plantation, PlantedField } from './types.js';
import { getSiloLimits } from './siloUtils.js';
import executeDailies from '../dailies/executeDailies.js';
import userRepository from '../../database/repositories/userRepository.js';

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
      flags: MessageFlags.Ephemeral,
    });

  const currentSeason = await getCurrentSeason();

  const fieldUpgrades = farmer.plantations[selectedField].upgrades ?? [];

  const harvestAt = getHarvestTime(currentSeason, seed, fieldUpgrades);

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
      flags: MessageFlags.Ephemeral,
    });
  }

  if (!field.isPlanted) return plantField(ctx, farmer, selectedField, seed, embedColor);

  const currentLimits = getSiloLimits(farmer);

  if (currentLimits.used + (field.weight ?? 1) >= currentLimits.limit) {
    if (currentLimits.used >= currentLimits.limit)
      return ctx.respondInteraction({
        flags: MessageFlags.Ephemeral,
        content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
          limit: currentLimits.limit,
        }),
      });

    field.weight = parseFloat((currentLimits.limit - currentLimits.used).toFixed(1));

    if (field.weight <= 0)
      return ctx.respondInteraction({
        flags: MessageFlags.Ephemeral,
        content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
          limit: currentLimits.limit,
        }),
      });
  }

  farmer.plantations[selectedField] = {
    isPlanted: false,
    upgrades: field.upgrades ?? [],
  };

  await farmerRepository.executeHarvest(
    ctx.user.id,
    selectedField,
    { isPlanted: false, upgrades: field.upgrades ?? [] },
    field.plantType,
    farmer.silo.some((a) => a.plant === field.plantType),
    state === 'MATURE',
    field.weight ?? 1,
  );

  if (state !== 'GROWING')
    postFazendinhaAction(
      `${ctx.user.id}`,
      field.plantType,
      state === 'MATURE' ? 'HARVEST' : 'ROTTED',
    );

  const harvestedWeight = state === 'MATURE' ? (field.weight ?? 1) : undefined;

  if (harvestedWeight)
    executeDailies.harvestPlant(
      await userRepository.ensureFindUser(ctx.user.id),
      field.plantType,
      harvestedWeight,
    );

  displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
    -1,
    harvestedWeight,
  );
};

const changeSelectedSeed = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const [embedColor] = ctx.sentData;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  displayPlantations(ctx, farmer, embedColor, Number(ctx.interaction.data.values[0]), -1);
};

const applyUpgrade = (buffId: AvailableItems, field: Plantation): Plantation => {
  const upgrades = field.upgrades ?? [];

  const currentUpgrade = upgrades.find((u) => u.id === buffId);

  const item = Items[buffId];
  const expiresAt = Date.now() + item.duration;

  if (currentUpgrade) {
    currentUpgrade.expiresAt = expiresAt;
    return field;
  }

  upgrades.push({ id: buffId, expiresAt });

  return { ...field, upgrades };
};

export { executeFieldAction, changeSelectedSeed, applyUpgrade };
