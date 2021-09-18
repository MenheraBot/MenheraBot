/* eslint-disable no-unused-vars */
import { IInteractionCommandConfig } from '@utils/Types';
import MenheraClient from 'MenheraClient';
import InteractionCommandContext from './InteractionContext';

export default class InteractionCommand {
  public dir!: string;

  constructor(public client: MenheraClient, public config: IInteractionCommandConfig) {}

  public run?(ctx: InteractionCommandContext): Promise<void>;
}
