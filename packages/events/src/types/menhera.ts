import { BigString, Bot, Collection } from 'discordeno';
import { ChatInputInteractionCommand } from './commands';
import ComponentInteractionContext from '../structures/command/ComponentInteractionContext';
import ChatInputInteractionContext from '../structures/command/ChatInputInteractionContext';

export interface IdentifiedData<T> {
  id: number;
  data: T;
}

export type InteractionContext = ChatInputInteractionContext | ComponentInteractionContext;

export interface MenheraClient extends Bot {
  commands: Collection<string, ChatInputInteractionCommand>;
  ownerId: bigint;
  shuttingDown: boolean;
  username: string;
  isMaster: boolean;
  commandsInExecution: number;
  respondInteraction: Map<BigString, (...args: unknown[]) => unknown>;
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
