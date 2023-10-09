import { ButtonComponent, ButtonStyles, DiscordEmbedField } from 'discordeno/types';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { AvailablePlants, Plantation } from './types';
import { DatabaseFarmerSchema } from '../../types/database';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { chunkArray } from '../../utils/miscUtils';
import { InteractionContext } from '../../types/menhera';
import { getPlantState } from './plantState';

const getPlantationDisplay = (icon: string): string =>
  `${icon}${icon}${icon}\n${icon}${icon}${icon}\n${icon}${icon}${icon}`;

const PlantIcon: Record<AvailablePlants, string> = {
  [AvailablePlants.Mate]: '🌱',
};

const parseUserPlantations = (
  ctx: InteractionContext,
  plantations: Plantation[],
  embedColor: string,
): [DiscordEmbedField[], ButtonComponent[]] => {
  const fields: DiscordEmbedField[] = [];
  const buttons: ButtonComponent[] = [];

  plantations.forEach((field, i) => {
    const fieldText = field.isPlanted
      ? getPlantationDisplay(PlantIcon[field.plantType])
      : getPlantationDisplay('🟫');

    fields.push({ name: `Campo (${i + 1})`, value: fieldText, inline: true });

    const plantState = field.isPlanted && getPlantState(field);

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
        customId: createCustomId(0, ctx.user.id, ctx.commandId, `${i}`, embedColor),
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
  const [fields, buttons] = parseUserPlantations(ctx, farmer.plantations, embedColor);

  const embed = createEmbed({
    title: `Fazenda de ${getDisplayName(ctx.user)}`,
    color: hexStringToNumber(embedColor),
    fields,
  });

  const components = chunkArray(buttons, 3).map((a) => createActionRow(a as [ButtonComponent]));

  ctx.makeMessage({ embeds: [embed], components });
};

export { displayPlantations };
