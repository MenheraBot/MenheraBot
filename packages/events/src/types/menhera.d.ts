import { Bot, Collection } from 'discordeno';
import { ChatInputInteractionCommand } from './commands';

export interface MenheraClient extends Bot {
  commands: Collection<string, ChatInputInteractionCommand>;
  ownerId: bigint;
  shuttingDown: boolean;
}
