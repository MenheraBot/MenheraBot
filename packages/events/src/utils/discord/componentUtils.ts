import {
  ActionRow,
  BigString,
  ButtonComponent,
  InputTextComponent,
  MessageComponentTypes,
  SelectMenuComponent,
  SelectMenuUsersComponent,
} from 'discordeno/types';

type PropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const createCustomId = (
  executorIndex: number,
  target: BigString,
  commandId: BigString,
  ...data: unknown[]
): string => `${executorIndex}|${target}|${commandId}|${data.join('|')}`;

const resolveSeparatedStrings = (string: string): string[] => string.split(' | ');

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

const createUsersSelectMenu = (
  component: PropertyOptional<SelectMenuUsersComponent, 'type'>,
): SelectMenuUsersComponent => ({
  ...component,
  type: MessageComponentTypes.SelectMenuUsers,
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

export {
  createButton,
  createCustomId,
  createActionRow,
  createTextInput,
  createSelectMenu,
  resolveSeparatedStrings,
  createUsersSelectMenu,
};
