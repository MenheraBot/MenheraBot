import { InputTextComponent } from 'discordeno/types';
import { ModalInteraction } from '../../types/interaction.js';

interface FieldData {
  customId: string;
  value: string;
}

const extractFields = (interaction: ModalInteraction): FieldData[] =>
  interaction.data.components.reduce<FieldData[]>((p, c) => {
    const fieldData = (c.components as InputTextComponent[])[0];
    p.push({ customId: fieldData.customId, value: fieldData.value as string });
    return p;
  }, []);

export { extractFields };
