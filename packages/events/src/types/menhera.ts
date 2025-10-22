import { Bot, Collection, DesiredPropertiesBehavior } from '@discordeno/bot';
import { ChatInputInteractionCommand } from './commands.js';
import ComponentInteractionContext from '../structures/command/ComponentInteractionContext.js';
import ChatInputInteractionContext from '../structures/command/ChatInputInteractionContext.js';
import GenericInteractionContext from '../structures/command/GenericInteractionContext.js';
import { BotDesiredProperties } from '../index.js';

export interface IdentifiedData<T> {
  id: number;
  data: T;
}

export interface ProbabilityAmount {
  value: number;
  probability: number;
}

export interface ProbabilityType {
  value: string;
  probability: number;
}

export type InteractionContext = ChatInputInteractionContext | ComponentInteractionContext;

export type GenericContext =
  | ChatInputInteractionContext
  | ComponentInteractionContext
  | GenericInteractionContext;

export interface MenheraClient
  extends Bot<BotDesiredProperties, DesiredPropertiesBehavior.RemoveKey> {
  commands: Collection<string, ChatInputInteractionCommand>;
  ownerId: bigint;
  shuttingDown: boolean;
  prodLogSwitch: boolean;
  enableRatelimit: boolean;
  username: string;
  isMaster: boolean;
  commandsInExecution: number;
  changelog: {
    versionName: string;
    date: string;
    info: {
      hotfix?: string;
      added?: string;
      changed?: string;
      deprecated?: string;
      removed?: string;
      fixed?: string;
      security?: string;
    };
  } | null;
}
