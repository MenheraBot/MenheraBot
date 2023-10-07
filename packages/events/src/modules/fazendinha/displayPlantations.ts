import { DiscordEmbedField } from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { PlantTypes, Plantation } from './types';
import { DatabaseFarmerSchema } from '../../types/database';

const getPlantationDisplay = (icon: string): string =>
  `${icon}${icon}${icon}\n${icon}${icon}${icon}\n${icon}${icon}${icon}`;

const PlantIcon: Record<PlantTypes, string> = {
  0: '🌱',
};

const getUserFields = (plantations: Plantation[]): DiscordEmbedField[] =>
  plantations.map((field, i) => {
    const fieldText = field.isPlanted
      ? getPlantationDisplay(PlantIcon[field.plantType])
      : getPlantationDisplay('🟫');

    return { name: `Campo ${i + 1}`, value: fieldText };
  });

const displayPlantations = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const embed = createEmbed({
    title: `Fazenda de ${getDisplayName(ctx.author)}`,
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: getUserFields(farmer.plantations),
  });

  ctx.makeMessage({ embeds: [embed] });
};

export { displayPlantations };
