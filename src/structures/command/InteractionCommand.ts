import { IInteractionCommandConfig } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import InteractionCommandContext from './InteractionContext';

export default abstract class InteractionCommand {
  public dir!: string;

  constructor(public client: MenheraClient, public config: IInteractionCommandConfig) {}

  public abstract run?(ctx: InteractionCommandContext): Promise<void>;
}
