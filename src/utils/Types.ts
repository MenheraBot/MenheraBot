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
