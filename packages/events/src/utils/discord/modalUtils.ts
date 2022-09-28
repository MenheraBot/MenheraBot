import { ModalInteraction } from '../../types/interaction';

type FieldData = {
  customId: string;
  value: string;
};

const extractFields = (interaction: ModalInteraction): FieldData[] =>
  interaction.data.components[0].components.reduce<FieldData[]>((p, c) => {
    p.push({ customId: c.customId, value: c.value });
    return p;
  }, []);

export { extractFields };
