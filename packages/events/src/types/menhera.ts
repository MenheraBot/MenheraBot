import { BigString, Bot, Collection } from 'discordeno';
import { ChatInputInteractionCommand } from './commands';
import ComponentInteractionContext from '../structures/command/ComponentInteractionContext';
import ChatInputInteractionContext from '../structures/command/ChatInputInteractionContext';
import GenericInteractionContext from '../structures/command/GenericInteractionContext';

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

export interface MenheraClient extends Bot {
  commands: Collection<string, ChatInputInteractionCommand>;
  ownerId: bigint;
  shuttingDown: boolean;
  prodLogSwitch: boolean;
  enableRatelimit: boolean;
  username: string;
  isMaster: boolean;
  commandsInExecution: number;
  respondInteraction: Map<BigString, (...args: unknown[]) => unknown>;
  ackInteraction: Map<BigString, () => void>;
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
