import farmerRepository from '../../database/repositories/farmerRepository.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import { postFazendinhaAction } from '../../utils/apiRequests/statistics.js';
import { MessageFlags } from '@discordeno/bot';
import { displayPlantations } from './displayPlantations.js';
import { getFieldQuality, getFieldWeight, getHarvestTime, getPlantationState } from './plantationState.js';
import { Items, Plants } from './constants.js';
import { getCurrentSeason } from './seasonsManager.js';
import {
  AvailableItems,
  AvailablePlants,
  Plantation,
  PlantationState,
  PlantedField,
} from './types.js';
import { addPlants, getSiloLimits } from './siloUtils.js';
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

  let state = getPlantationState(field)[0];

  const userSeeds = farmer.seeds.find((a) => a.plant === seed);

  if (state === PlantationState.Growing && force !== 'Y') {
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
  let replyFullSilo = false;

  if (currentLimits.used + (field.weight ?? 1) >= currentLimits.limit) {
    if (currentLimits.used >= currentLimits.limit)
      return ctx.respondInteraction({
        flags: MessageFlags.Ephemeral,
        content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
          limit: currentLimits.limit,
        }),
      });

    field.weight = parseFloat((currentLimits.limit - currentLimits.used).toFixed(1));

    if (field.weight <= 0) {
      replyFullSilo = true;
      state = PlantationState.Growing;
    }
  }

  farmer.plantations[selectedField] = {
    isPlanted: false,
    upgrades: field.upgrades ?? [],
  };

  const success = state === PlantationState.Mature;
  const harvestedWeight = success ? (field.weight ?? 1) : 0;

  const newSilo = success
    ? addPlants(farmer.silo, [
        { plant: field.plantType, weight: harvestedWeight, quality: getFieldQuality(field) },
      ])
    : farmer.silo;

  await farmerRepository.executeHarvest(
    ctx.user.id,
    farmer.plantations,
    field.plantType,
    success,
    newSilo,
    harvestedWeight,
  );

  if (state !== PlantationState.Growing)
    postFazendinhaAction(`${ctx.user.id}`, field.plantType, success ? 'HARVEST' : 'ROTTED');

  if (harvestedWeight > 0)
    executeDailies.harvestPlant(
      await userRepository.ensureFindUser(ctx.user.id),
      field.plantType,
      harvestedWeight,
    );

  await displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
    -1,
    harvestedWeight,
  );

  if (replyFullSilo)
    return ctx.followUp({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
        limit: currentLimits.limit,
      }),
    });
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
