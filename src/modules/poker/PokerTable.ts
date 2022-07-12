import { IUserSchema } from '@custom_types/Menhera';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageComponentInteraction, User } from 'discord.js-light';

export default class PokerTable {
  constructor(
    private ctx: InteractionCommandContext,
    private players: User[],
    private playersData: IUserSchema[],
    private interactions: MessageComponentInteraction[],
  ) {}

  async startMatch(): Promise<void> {
    console.log(this.players, this.ctx.client.user.id, this.interactions, this.playersData);
  }
}
