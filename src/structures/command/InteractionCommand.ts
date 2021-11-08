import { IInteractionCommandConfig, IUserSchema } from '@utils/Types';
import InteractionCommandContext from './InteractionContext';

export default abstract class InteractionCommand {
  public dir!: string;

  public config: IInteractionCommandConfig & { authorDataFields: Array<keyof IUserSchema> };

  constructor(config: IInteractionCommandConfig) {
    this.config = { ...config, authorDataFields: config.authorDataFields ?? [] };
  }

  public abstract run?(ctx: InteractionCommandContext): Promise<void>;
}
