import { ApplicationCommand, Bot } from 'discordeno/*';
import { DatabaseUserSchema } from './database';

import InteractionContext from '../structures/command/InteractionContext';

export interface ChatInputCommandConfig extends ApplicationCommand {
  devsOnly?: boolean;
  category: string;
  authorDataFields: Array<keyof DatabaseUserSchema>;
}

export default interface ChatInputInteractionCommand {
  readonly dir: string;
  readonly config: ChatInputCommandConfig;

  readonly run: (context: InteractionContext) => Promise<void>;
}

export interface MenheraClient extends Bot {
  commands: Map<string, ChatInputInteractionCommand>;
}
