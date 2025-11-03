import type {
  ActionRow,
  BigString,
  ButtonComponent,
  TextInputComponent,
  StringSelectComponent,
  ContainerComponent,
  UserSelectComponent,
  TextDisplayComponent,
  SeparatorComponent,
} from '@discordeno/bot';

import { MessageComponentTypes } from '@discordeno/bot';

type PropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const createCustomId = (
  executorIndex: number,
  target: BigString,
  originalInteractionId: BigString,
  ...data: unknown[]
): string => `${executorIndex}|${target}|${originalInteractionId}|${data.join('|')}`;

const resolveSeparatedStrings = (string: string): string[] => string.split('|');

const createButton = (component: PropertyOptional<ButtonComponent, 'type'>): ButtonComponent => ({
  ...component,
  type: MessageComponentTypes.Button,
});

const createSelectMenu = (
  component: PropertyOptional<StringSelectComponent, 'type'>,
): StringSelectComponent => ({
  ...component,
  type: MessageComponentTypes.StringSelect,
});

const createUsersSelectMenu = (
  component: PropertyOptional<UserSelectComponent, 'type'>,
): UserSelectComponent => ({
  ...component,
  type: MessageComponentTypes.UserSelect,
});

const createTextInput = (
  component: PropertyOptional<TextInputComponent, 'type'>,
): TextInputComponent => ({
  ...component,
  type: MessageComponentTypes.TextInput,
});

const createActionRow = (components: ActionRow['components']): ActionRow => ({
  type: MessageComponentTypes.ActionRow,
  components,
});

const createContainer = (
  component: PropertyOptional<ContainerComponent, 'type'>,
): ContainerComponent => ({ ...component, type: MessageComponentTypes.Container });

const createTextDisplay = (content: string): TextDisplayComponent => ({
  type: MessageComponentTypes.TextDisplay,
  content,
});

const createSeparator = (
  component?: PropertyOptional<SeparatorComponent, 'type'>,
): SeparatorComponent => ({
  ...component,
  type: MessageComponentTypes.Separator,
});

export {
  createButton,
  createCustomId,
  createActionRow,
  createTextDisplay,
  createTextInput,
  createSelectMenu,
  resolveSeparatedStrings,
  createContainer,
  createSeparator,
  createUsersSelectMenu,
};
