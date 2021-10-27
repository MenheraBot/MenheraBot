import { IInteractionCommandConfig, IUserSchema } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import InteractionCommandContext from './InteractionContext';

export default abstract class InteractionCommand {
  public dir!: string;

  public config: IInteractionCommandConfig & { authorDataFields: Array<keyof IUserSchema> };

  constructor(public client: MenheraClient, config: IInteractionCommandConfig) {
    this.config = { ...config, authorDataFields: config.authorDataFields ?? [] };
  }

  public abstract run?(ctx: InteractionCommandContext): Promise<void>;
}
