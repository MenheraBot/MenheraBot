import { ICommandConfig } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import CommandContext from './CommandContext';

export default abstract class Command {
  public config: ICommandConfig;

  public dir: string;

  abstract run(ctx: CommandContext): Promise<any>;

  constructor(public client: MenheraClient, options: ICommandConfig) {
    this.client = client;

    this.config = {
      name: options.name || null,
      category: options.category || 'util',
      aliases: options.aliases || [],
      description: options.description || null,
      cooldown: options.cooldown || 3,
      userPermissions: options.userPermissions || null,
      clientPermissions: options.clientPermissions || null,
      devsOnly: options.devsOnly || false,
    };

    this.dir = null;
  }
}
