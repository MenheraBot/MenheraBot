import InteractionCommandContext from '@structures/command/InteractionContext';
import { Message, MessageOptions, MessagePayload, TextBasedChannels } from 'discord.js';
import { TBattleEntity } from './Types';

export default class BolehamBattle {
  private attackerIndex = 0;

  private defenderIndex = 0;

  constructor(
    private ctx: InteractionCommandContext,
    private battleling: TBattleEntity[],
    private enemy: TBattleEntity[],
  ) {}

  private async send(options: string | MessagePayload | MessageOptions): Promise<Message> {
    let { channel } = this.ctx;
    if (typeof channel === 'undefined' || channel.partial)
      channel = (await this.ctx.client.channels.fetch(
        this.ctx.interaction.channelId,
      )) as TextBasedChannels;

    return channel.send(options);
  }

  public async startBattle(): Promise<this> {
    this.send(
      `${this.battleling[0].life} ${this.enemy[0].speed} ${this.attackerIndex}, ${this.defenderIndex}`,
    );

    return this;
  }
}
