import { Bot } from 'discordeno';
import { ChatInputInteractionCommand } from './commands';

export interface MenheraClient extends Bot {
  commands: Map<string, ChatInputInteractionCommand>;
  ownerId: bigint;
}
