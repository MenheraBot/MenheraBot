/* eslint-disable no-unused-vars */
export interface IClientConfigs {
  commandsDirectory: string;
  eventsDirectory: string;
}

export interface ICommandConfig {
  name: string;
  category: string;
  aliases: Array<string>;
  description?: string;
  cooldown?: number;
  userPermissions?: Array<string>;
  clientPermissions?: Array<string>;
  devsOnly?: boolean;
}

export interface IEvent {
  name: string;
  dir: string;
  run: (args: Array<unknown>) => Promise<unknown>;
}

export interface IHttpPicassoReutrn {
  err: boolean;
  data?: unknown;
}

export interface IBlackjackCards {
  value: number;
  isAce: boolean;
  id: number;
  hidden?: boolean;
}
