import { Interaction } from 'discordeno/transformers';
import { InteractionTypes, MessageComponentTypes } from 'discordeno/types';
import { EventEmitter } from 'node:events';

import { interactionEmitter } from '../index';

type InteractionCollectorOptions = {
  filter: (interaction: Interaction) => boolean | Promise<boolean>;
  time?: number;
  idle?: number;
  channelId: bigint;
  interactionType?: InteractionTypes;
  componentType?: MessageComponentTypes;
};

export default class InteractionCollector extends EventEmitter {
  private timeout: NodeJS.Timeout | null = null;

  private idletimeout: NodeJS.Timeout | null = null;

  private ended = false;

  private endReason: string | null = null;

  private collected = new Map<bigint, Interaction>();

  constructor(private options: InteractionCollectorOptions) {
    super();

    if (options.time) this.timeout = setTimeout(() => this.stop('time'), options.time).unref();
    if (options.idle) this.idletimeout = setTimeout(() => this.stop('idle'), options.idle).unref();

    const handleCollect = this.handleCollect.bind(this);

    interactionEmitter.on('interaction', handleCollect);
  }

  stop(reason = 'user'): void {
    if (this.ended) return;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.idletimeout) {
      clearTimeout(this.idletimeout);
      this.idletimeout = null;
    }

    this.endReason = reason;
    this.ended = true;

    this.emit('end', this.collected, reason);
  }

  collect(interaction: Interaction): null | bigint {
    if (this.options.interactionType && this.options.interactionType !== interaction.type)
      return null;

    if (
      this.options.componentType &&
      this.options.componentType !== interaction.data?.componentType
    )
      return null;

    if (this.options.channelId !== interaction.channelId) return null;

    return interaction.id;
  }

  checkEnd(): boolean {
    const reason = this.endReason;
    if (reason) this.stop(reason);
    return Boolean(reason);
  }

  async handleCollect(interaction: Interaction): Promise<void> {
    const collectedId = this.collect(interaction);

    if (!collectedId) return;

    const passFilter = await this.options.filter(interaction);

    if (!passFilter) return;

    this.collected.set(collectedId, interaction);

    this.emit('collect', interaction);

    if (this.idletimeout) {
      clearTimeout(this.idletimeout);
      this.idletimeout = setTimeout(() => this.stop('idle'), this.options.idle).unref();
    }

    this.checkEnd();
  }
}
