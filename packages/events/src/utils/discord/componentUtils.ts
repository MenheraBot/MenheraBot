import { ActionRow, ButtonComponent, MessageComponentTypes } from 'discordeno/types';

type PropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const createButton = (component: PropertyOptional<ButtonComponent, 'type'>): ButtonComponent => ({
  ...component,
  type: MessageComponentTypes.Button,
});

const createActionRow = (components: ActionRow['components']): ActionRow => ({
  type: MessageComponentTypes.ActionRow,
  components,
});

const disableComponents = (
  label: string,
  components: ActionRow['components'],
): ActionRow['components'] =>
  // @ts-expect-error Weird Type
  components.map((c) => {
    if (c.type === MessageComponentTypes.Button)
      return {
        ...c,
        label,
        disabled: true,
      };

    return { ...c, placeholder: label, disabled: true };
  });

export { createButton, createActionRow, disableComponents };
