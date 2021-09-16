import InteractionCommandContext from '@structures/command/InteractionContext';
import { Message, MessageOptions, MessagePayload, TextBasedChannels } from 'discord.js';
import EventEmitter from 'events';
import { TBattleEntity } from './Types';

export default class BolehamBattle extends EventEmitter {
  private attackerIndex = 0;

  private defenderIndex = 0;

  constructor(
    private ctx: InteractionCommandContext,
    private battleling: TBattleEntity[],
    private enemy: TBattleEntity[],
  ) {
    super();
  }

  private onError(reason: string): void {
    this.emit('error', reason);
  }

  private async send(options: string | MessagePayload | MessageOptions): Promise<Message | void> {
    const channel =
      !this.ctx?.channel?.send || this.ctx.channel.partial
        ? ((await this.ctx.client.channels.fetch(
            this.ctx.interaction.channelId,
          )) as TextBasedChannels)
        : this.ctx.channel;

    return channel.send(options).catch(() => this.onError('SEND_MESSAGE'));
  }

  public async startBattle(): Promise<this> {
    this.send(
      `${this.battleling[0].life} ${this.enemy[0].speed} ${this.attackerIndex}, ${this.defenderIndex}`,
    );

    return this;
  }
}
