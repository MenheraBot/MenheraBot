/* eslint-disable no-use-before-define */
import { CreateSlashApplicationCommand } from 'discordeno';

import ComponentInteractionContext from '../structures/command/ComponentInteractionContext';
import ChatInputInteractionContext from '../structures/command/ChatInputInteractionContext';
import { DatabaseUserSchema } from './database';

type CommandCategory =
  | 'economy'
  | 'roleplay'
  | 'fun'
  | 'actions'
  | 'info'
  | 'dev'
  | 'util'
  | 'event';

export interface ChatInputCommandConfig extends CreateSlashApplicationCommand {
  devsOnly?: true;
  category: CommandCategory;
  authorDataFields: Array<keyof DatabaseUserSchema>;
}

export interface ChatInputInteractionCommand extends Readonly<ChatInputCommandConfig> {
  path: string;

  readonly execute: (
    ctx: ChatInputInteractionContext,
    finishCommand: (...args: unknown[]) => unknown,
  ) => Promise<unknown>;

  readonly commandRelatedExecutions?: ((
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: ComponentInteractionContext<any>,
  ) => Promise<unknown>)[];
}

export interface UsedCommandData {
  authorId: string;
  guildId: string;
  commandName: string;
  data: number;
  args: unknown[];
}

export interface MaintenanceCommandData {
  isDisabled: boolean;
  reason: string | null;
}

export interface ApiCommandInformation {
  name: string;
  nameLocalizations?: unknown;
  description: string;
  descriptionLocalizations?: unknown;
  category: string;
  options: unknown[];
  disabled: MaintenanceCommandData;
}
