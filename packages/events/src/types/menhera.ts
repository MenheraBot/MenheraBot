import { Bot, Collection } from 'discordeno';
import { ChatInputInteractionCommand } from './commands';

export interface IdentifiedData<T> {
  id: number;
  data: T;
}

export interface MenheraClient extends Bot {
  commands: Collection<string, ChatInputInteractionCommand>;
  ownerId: bigint;
  shuttingDown: boolean;
  username: string;
  commandsInExecution: number;
}
