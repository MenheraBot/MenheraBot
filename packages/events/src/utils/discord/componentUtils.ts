import type {
  ActionRow,
  BigString,
  ButtonComponent,
  TextInputComponent,
  StringSelectComponent,
  UserSelectComponent,
  SeparatorComponent,
  TextDisplayComponent,
  ContainerComponent,
  InteractionCallbackData,
} from '@discordeno/bot';

import { MessageComponentTypes } from '@discordeno/bot';
import md5 from 'md5';
import commandRepository from '../../database/repositories/commandRepository.js';
import { setComponentsV2Flag } from './messageUtils.js';

type PropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const createCustomId = (
  executorIndex: number,
  target: BigString,
  originalInteractionId: BigString,
  ...data: unknown[]
): string => `${executorIndex}|${target}|${originalInteractionId}|${data.join('|')}`;

const createAsyncCustomId = async (
  executorIndex: number,
  target: BigString,
  originalInteractionId: BigString,
  ...data: unknown[]
): Promise<string> => {
  const customIdData = createCustomId(executorIndex, target, originalInteractionId, ...data);

  const generatedId = md5(`${customIdData}${Date.now()}`);

  await commandRepository.setCustomIdData(generatedId, customIdData);

  return generatedId;
};

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

const enableLayoutMessage = (
  message: Omit<InteractionCallbackData, 'embed' | 'content' | 'stickers' | 'poll'>,
): InteractionCallbackData => ({
  ...message,
  flags: setComponentsV2Flag(message.flags ?? 0),
  content: '',
  embeds: [],
});

export {
  createButton,
  createContainer,
  createTextDisplay,
  createSeparator,
  createCustomId,
  createActionRow,
  createTextInput,
  createAsyncCustomId,
  createSelectMenu,
  enableLayoutMessage,
  resolveSeparatedStrings,
  createUsersSelectMenu,
};
