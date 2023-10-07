import { ButtonComponent, ButtonStyles, DiscordEmbedField } from 'discordeno/types';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { PlantTypes, Plantation } from './types';
import { DatabaseFarmerSchema } from '../../types/database';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { chunkArray } from '../../utils/miscUtils';
import { InteractionContext } from '../../types/menhera';

const getPlantationDisplay = (icon: string): string =>
  `${icon}${icon}${icon}\n${icon}${icon}${icon}\n${icon}${icon}${icon}`;

const PlantIcon: Record<PlantTypes, string> = {
  0: '🌱',
};

const parseUserPlantations = (
  ctx: InteractionContext,
  plantations: Plantation[],
): [DiscordEmbedField[], ButtonComponent[]] => {
  const fields: DiscordEmbedField[] = [];
  const buttons: ButtonComponent[] = [];

  plantations.forEach((field, i) => {
    const fieldText = field.isPlanted
      ? getPlantationDisplay(PlantIcon[field.plantType])
      : getPlantationDisplay('🟫');

    fields.push({ name: `Campo (${i + 1})`, value: fieldText, inline: true });

    buttons.push(
      createButton({
        label: field.isPlanted ? `Colher (${i + 1})` : `Plantar (${i + 1})`,
        // Danger - Estragado, Secondary - Não está maduro, Success - Pode colher sem problemas
        style: field.isPlanted ? ButtonStyles.Success : ButtonStyles.Primary,
        customId: createCustomId(0, ctx.user.id, ctx.commandId, `${i}`),
      }),
    );
  });

  return [fields, buttons];
};
const displayPlantations = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const [fields, buttons] = parseUserPlantations(ctx, farmer.plantations);

  const embed = createEmbed({
    title: `Fazenda de ${getDisplayName(ctx.user)}`,
    color: hexStringToNumber(embedColor),
    fields,
  });

  const components = chunkArray(buttons, 3).map((a) => createActionRow(a as [ButtonComponent]));

  ctx.makeMessage({ embeds: [embed], components });
};

export { displayPlantations };
