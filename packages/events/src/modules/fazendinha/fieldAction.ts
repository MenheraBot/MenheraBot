import farmerRepository from '../../database/repositories/farmerRepository.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import {
  postFazendinhaAction,
  postMultipleFazendinhaHarvest,
} from '../../utils/apiRequests/statistics.js';
import { MessageFlags } from '@discordeno/bot';
import { displayPlantations } from './displayPlantations.js';
import {
  getFieldQuality,
  getFieldWeight,
  getHarvestTime,
  getPlantationState,
} from './plantationState.js';
import { Items, Plants } from './constants.js';
import { getCurrentSeason } from './seasonsManager.js';
import {
  AvailableItems,
  AvailablePlants,
  Plantation,
  PlantationState,
  PlantedField,
  Seasons,
} from './types.js';
import { addPlants, getSiloLimits, isMatePlant, removePlants } from './siloUtils.js';
import executeDailies from '../dailies/executeDailies.js';
import userRepository from '../../database/repositories/userRepository.js';

const getPlantedField = (
  farmer: DatabaseFarmerSchema,
  selectedField: number,
  seed: AvailablePlants,
  currentSeason: Seasons,
): PlantedField => {
  const fieldUpgrades = farmer.plantations[selectedField].upgrades ?? [];

  const harvestAt = getHarvestTime(currentSeason, seed, fieldUpgrades);

  const weight = getFieldWeight(seed, currentSeason, fieldUpgrades);

  return {
    isPlanted: true as const,
    harvestAt,
    plantedSeason: currentSeason,
    plantType: seed,
    weight,
    upgrades: fieldUpgrades,
  } satisfies PlantedField;
};

const plantFields = async (
  ctx: ComponentInteractionContext,
  farmer: DatabaseFarmerSchema,
  selectedFields: number[],
  seed: AvailablePlants,
  embedColor: string,
) => {
  const currentSeason = await getCurrentSeason();

  selectedFields.forEach((index) => {
    const updatedUserSeeds = farmer.seeds.find((a) => a.plant === seed);

    if (!updatedUserSeeds || updatedUserSeeds.amount <= 0) seed = AvailablePlants.Mate;

    const newField = getPlantedField(farmer, index, seed, currentSeason);
    farmer.plantations[index] = newField;

    if (!isMatePlant(seed)) farmer.seeds = removePlants(farmer.seeds, [{ amount: 1, plant: seed }]);
  });

  await farmerRepository.executePlant(ctx.user.id, farmer.plantations, seed, farmer.seeds);

  const userSeeds = farmer.seeds.find((a) => a.plant === seed);

  return displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
    -1,
  );
};

const plantAllFields = (
  ctx: ComponentInteractionContext,
  embedColor: string,
  farmer: DatabaseFarmerSchema,
  selectedSeed: AvailablePlants,
) => {
  const ableToPlantIndexes = farmer.plantations.flatMap((p, i) => (p.isPlanted ? [] : [i]));

  const userSeeds = farmer.seeds.find((a) => a.plant === selectedSeed);

  if (ableToPlantIndexes.length === 0)
    return displayPlantations(
      ctx,
      farmer,
      embedColor,
      !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : selectedSeed,
      -1,
    );

  return plantFields(ctx, farmer, ableToPlantIndexes, selectedSeed, embedColor);
};

const harvestAllFields = async (
  ctx: ComponentInteractionContext,
  embedColor: string,
  farmer: DatabaseFarmerSchema,
  selectedSeed: AvailablePlants,
) => {
  const ableToHarvestIndexes = farmer.plantations.flatMap((p, i) =>
    getPlantationState(p)[0] === PlantationState.Mature ? [i] : [],
  );

  const userSeeds = farmer.seeds.find((a) => a.plant === selectedSeed);

  if (ableToHarvestIndexes.length === 0)
    return displayPlantations(
      ctx,
      farmer,
      embedColor,
      !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : selectedSeed,
      -1,
    );

  const currentLimits = getSiloLimits(farmer);
  let replyFullSilo = false;

  const added: QuantitativePlant[] = [];

  ableToHarvestIndexes.forEach((index, iteration) => {
    const field = farmer.plantations[index] as PlantedField;
    let [state] = getPlantationState(field);

    if (currentLimits.used + Math.floor(field.weight ?? 1) >= currentLimits.limit) {
      if (currentLimits.used >= currentLimits.limit && iteration === 0)
        return ctx.followUp({
          flags: MessageFlags.Ephemeral,
          content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
            limit: currentLimits.limit,
          }),
        });

      return;
    }

    farmer.plantations[index] = {
      isPlanted: false,
      upgrades: field.upgrades ?? [],
    };

    const success = state === PlantationState.Mature;
    const harvestedWeight = success ? (field.weight ?? 1) : 0;

    const toAdd = {
      plant: field.plantType,
      weight: harvestedWeight,
      // TODO: Get Real Quality
      quality: getFieldQuality(field),
    };

    added.push(toAdd);

    farmer.silo = success ? addPlants(farmer.silo, [toAdd]) : farmer.silo;
  });

  await farmerRepository.executeHarvest(ctx.user.id, farmer.plantations, true, farmer.silo, added);

  await postMultipleFazendinhaHarvest(`${ctx.user.id}`, added);

  await executeDailies.harvestPlant(await userRepository.ensureFindUser(ctx.user.id), added);

  await displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : selectedSeed,
    -1,
    added,
  );

  if (replyFullSilo)
    return ctx.followUp({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
        limit: currentLimits.limit,
      }),
    });
};

const executeFieldAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const [selectedFieldString, embedColor, selectedSeedString, force] = ctx.sentData;

  const seed = Number(selectedSeedString);

  if (selectedFieldString === 'PLANT_ALL') return plantAllFields(ctx, embedColor, farmer, seed);
  if (selectedFieldString === 'HARVEST_ALL') return harvestAllFields(ctx, embedColor, farmer, seed);

  const selectedField = Number(selectedFieldString);

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

  if (!field.isPlanted) return plantFields(ctx, farmer, [selectedField], seed, embedColor);

  const currentLimits = getSiloLimits(farmer);
  let replyFullSilo = false;

  if (currentLimits.used + (field.weight ?? 1) >= currentLimits.limit) {
    if (currentLimits.used >= currentLimits.limit)
      return ctx.followUp({
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

  const added = [
    {
      plant: field.plantType,
      weight: harvestedWeight,
      quality: getFieldQuality(field),
    },
  ];

  const newSilo = success ? addPlants(farmer.silo, added) : farmer.silo;

  await farmerRepository.executeHarvest(ctx.user.id, farmer.plantations, success, newSilo, added);

  if (state !== PlantationState.Growing)
    postFazendinhaAction(`${ctx.user.id}`, field.plantType, success ? 'HARVEST' : 'ROTTED');

  if (harvestedWeight > 0)
    executeDailies.harvestPlant(await userRepository.ensureFindUser(ctx.user.id), added);

  await displayPlantations(
    ctx,
    farmer,
    embedColor,
    !userSeeds || userSeeds.amount <= 0 ? AvailablePlants.Mate : seed,
    -1,
    added,
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
