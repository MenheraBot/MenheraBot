import {
  ActionRow,
  ButtonComponent,
  InputTextComponent,
  MessageComponentTypes,
  SelectMenuComponent,
} from 'discordeno/types';

type PropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const generateCustomId = <R = false>(
  customIdentifier: string,
  baseId?: bigint | number,
  returnBase?: R,
): R extends false ? string : [string, number | bigint] => {
  const randomNumber = baseId ?? Math.floor(Date.now() + Math.random() * 100);

  if (!returnBase)
    return `${randomNumber} | ${customIdentifier}` as R extends false
      ? string
      : [string, number | bigint];

  return [`${randomNumber} | ${customIdentifier}`, randomNumber] as R extends false
    ? string
    : [string, number | bigint];
};

const resolveCustomId = (customId: string): string =>
  customId
    .replace(/^[\s\d]+/, '')
    .replace('|', '')
    .trim();

const createButton = (component: PropertyOptional<ButtonComponent, 'type'>): ButtonComponent => ({
  ...component,
  type: MessageComponentTypes.Button,
});

const createSelectMenu = (
  component: PropertyOptional<SelectMenuComponent, 'type'>,
): SelectMenuComponent => ({
  ...component,
  type: MessageComponentTypes.SelectMenu,
});

const createTextInput = (
  component: PropertyOptional<InputTextComponent, 'type'>,
): InputTextComponent => ({
  ...component,
  type: MessageComponentTypes.InputText,
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

export {
  createButton,
  createActionRow,
  disableComponents,
  generateCustomId,
  resolveCustomId,
  createTextInput,
  createSelectMenu,
};
