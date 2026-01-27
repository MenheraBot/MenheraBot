import { TextInputComponent } from '@discordeno/bot';
import { ModalInteraction } from '../../types/interaction.js';
import { isUndefined } from '../miscUtils.js';

interface FieldData {
  customId: string;
  value: string;
}

interface LayoutFieldData {
  customId: string;
  value?: string;
}

const extractLayoutFields = (interaction: ModalInteraction): LayoutFieldData[] =>
  interaction.data.components.reduce<LayoutFieldData[]>((p, c) => {
    const component = c.component;

    const noDataSent = isUndefined(component?.value) && isUndefined(component?.values);

    p.push({
      customId: `${component?.customId}`,
      value: noDataSent ? undefined : `${component?.value ?? component?.values?.[0]}`,
    });
    return p;
  }, []);

const extractFields = (interaction: ModalInteraction): FieldData[] =>
  interaction.data.components.reduce<FieldData[]>((p, c) => {
    const fieldData = (c.components as TextInputComponent[])[0];
    p.push({ customId: fieldData.customId, value: fieldData.value as string });
    return p;
  }, []);

export { extractFields, extractLayoutFields };
