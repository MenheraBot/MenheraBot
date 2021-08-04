/* eslint-disable no-unused-vars */
import { ICommandConfig } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import CommandContext from './CommandContext';

export default class Command {
  public config: ICommandConfig;

  public dir!: string;

  constructor(public client: MenheraClient, options: ICommandConfig) {
    this.client = client;

    this.config = {
      name: options.name,
      category: options.category || 'util',
      aliases: options.aliases || [],
      cooldown: options.cooldown || 3,
      userPermissions: options?.userPermissions,
      clientPermissions: options?.clientPermissions,
      devsOnly: !!options.devsOnly,
    };
  }

  public run?(ctx: CommandContext): Promise<void>;
}
