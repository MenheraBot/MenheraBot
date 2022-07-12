import InteractionCommandContext from '@structures/command/InteractionContext';
import { User } from 'discord.js-light';

export default class PokerTable {
  constructor(private ctx: InteractionCommandContext, private players: User[]) {}

  async startMatch(): Promise<void> {
    console.log(this.players, this.ctx.client.user.id);
  }
}
