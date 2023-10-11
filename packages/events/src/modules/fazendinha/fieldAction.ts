import farmerRepository from '../../database/repositories/farmerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { displayPlantations } from './displayPlantations';
import { getPlantationState } from './plantationState';
import { AvailablePlants } from './types';

const executeFieldAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const [selectedFieldString, embedColor, selectedSeedString] = ctx.sentData;
  const selectedField = Number(selectedFieldString);
  const seed = Number(selectedSeedString);

  const field = farmer.plantations[selectedField];

  const state = getPlantationState(field)[0];

  if (state === 'GROWING')
    return ctx.respondInteraction({
      content: 'Este campo ainda está crescendo. Você não pode colhê-lo ainda',
      flags: MessageFlags.EPHEMERAL,
    });

  const userSeeds = farmer.seeds.find((a) => a.plant === seed);

  if (!field.isPlanted) {
    if (seed !== AvailablePlants.Mate && (!userSeeds || userSeeds.amount <= 0))
      return ctx.respondInteraction({
        content: `Você não possui sementes de Mate para plantar.`,
        flags: MessageFlags.EPHEMERAL,
      });

    const newField = {
      isPlanted: true as const,
      plantedAt: Date.now(),
      plantType: Number(seed),
    };

    farmer.plantations[selectedField] = newField;
    if (userSeeds && seed !== AvailablePlants.Mate) userSeeds.amount -= 1;

    await farmerRepository.executePlant(ctx.user.id, selectedField, newField, seed);
  } else {
    farmer.plantations[selectedField] = { isPlanted: false };

    await farmerRepository.executeHarvest(
      ctx.user.id,
      selectedField,
      { isPlanted: false },
      field.plantType,
      farmer.silo.some((a) => a.plant === field.plantType),
      state === 'MATURE',
    );
  }

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

  const [selectedSeed] = ctx.interaction.data.values;

  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  displayPlantations(ctx, farmer, embedColor, Number(selectedSeed));
};
export { executeFieldAction, changeSelectedSeed };
