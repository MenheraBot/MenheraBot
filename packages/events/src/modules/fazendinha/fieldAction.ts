import farmerRepository from '../../database/repositories/farmerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { logger } from '../../utils/logger';
import { displayPlantations } from './displayPlantations';
import { getPlantState } from './plantState';
import { AvailablePlants } from './types';

const executeFieldAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);

  const [selectedFieldString, embedColor] = ctx.sentData;
  const selectedField = Number(selectedFieldString);

  const field = farmer.plantations[selectedField];
  const isPlanted = field?.isPlanted;

  const state = isPlanted && getPlantState(field);

  if (state === 'GROWING')
    return ctx.respondInteraction({
      content: 'Este campo ainda está crescendo. Você não pode colhê-lo ainda',
      flags: MessageFlags.EPHEMERAL,
    });

  const newField = isPlanted
    ? { isPlanted: false as const }
    : {
        isPlanted: true,
        plantedAt: Date.now(),
        plantType: AvailablePlants.Mate,
      };

  farmer.plantations[selectedField] = newField;

  await farmerRepository.updateField(ctx.user.id, selectedField, newField);

  displayPlantations(ctx, farmer, embedColor);

  if (!isPlanted) return;

  if (state === 'MATURE') logger.debug('+ 1 erva pra conta');
};

export { executeFieldAction };
