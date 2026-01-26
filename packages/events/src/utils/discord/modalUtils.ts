import { TextInputComponent } from '@discordeno/bot';
import { ModalInteraction } from '../../types/interaction.js';

interface FieldData {
  customId: string;
  value: string;
}

const extractLayoutFields = (interaction: ModalInteraction): FieldData[] =>
  interaction.data.components.reduce<FieldData[]>((p, c) => {
    const fieldData = c.component as TextInputComponent;
    p.push({ customId: fieldData.customId, value: fieldData.value as string });
    return p;
  }, []);

const extractFields = (interaction: ModalInteraction): FieldData[] =>
  interaction.data.components.reduce<FieldData[]>((p, c) => {
    const fieldData = (c.components as TextInputComponent[])[0];
    p.push({ customId: fieldData.customId, value: fieldData.value as string });
    return p;
  }, []);

export { extractFields, extractLayoutFields };
