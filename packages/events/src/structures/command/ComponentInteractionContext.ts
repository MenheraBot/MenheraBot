import * as Sentry from '@sentry/node';
import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';
import { User } from 'discordeno/transformers';
import { TFunction } from 'i18next';

import { bot } from '../../index';
import { Translation } from '../../types/i18next';
import { ComponentInteraction } from '../../types/interaction';
import { logger } from '../../utils/logger';
import { EMOJIS } from '../constants';
import { MessageFlags } from '../../utils/discord/messageUtils';

export type CanResolve = 'users' | 'members' | false;

export default class<InteractionType extends ComponentInteraction = ComponentInteraction> {
  private replied = false;

  constructor(public interaction: InteractionType, public i18n: TFunction) {}

  get user(): User {
    return this.interaction.user;
  }

  get commandAuthor(): User {
    return this.interaction.message?.interaction?.user as User;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
  }

  get commandId(): bigint {
    return BigInt(this.interaction.data.customId.split('|')[2]);
  }

  get sentData(): string[] {
    return this.interaction.data.customId.split('|').slice(3);
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${EMOJIS[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async followUp(options: InteractionCallbackData): Promise<void> {
    await bot.helpers
      .sendFollowupMessage(this.interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: options,
      })
      .catch((e) => this.captureException(e));
  }

  async respondWithModal(options: InteractionCallbackData): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await bot.helpers
      .sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.Modal,
        data: options,
      })
      .catch((e) => this.captureException(e));
  }

  async ack(): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await bot.helpers
      .sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.DeferredUpdateMessage,
      })
      .catch((e) => this.captureException(e));
  }

  async visibleAck(ephemeral: boolean): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await bot.helpers.sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.DeferredChannelMessageWithSource,
      data: {
        flags: ephemeral ? MessageFlags.EPHEMERAL : undefined,
      },
    });
  }

  async respondInteraction(
    options: InteractionCallbackData & { attachments?: unknown[] },
  ): Promise<void> {
    if (!this.replied) {
      await bot.helpers
        .sendInteractionResponse(this.interaction.id, this.interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: options,
        })
        .catch((e) => this.captureException(e));
      this.replied = true;
      return;
    }

    await bot.helpers
      .editOriginalInteractionResponse(this.interaction.token, options)
      .catch((e) => this.captureException(e));
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    if (!this.replied) {
      this.replied = true;
      await bot.helpers
        .sendInteractionResponse(this.interaction.id, this.interaction.token, {
          type: InteractionResponseTypes.UpdateMessage,
          data: options,
        })
        .catch((e) => this.captureException(e));
      return;
    }

    await bot.helpers
      .editOriginalInteractionResponse(this.interaction.token, options)
      .catch((e) => this.captureException(e));
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  captureException(error: Error): null {
    logger.error(error.message);

    Sentry.withScope((scope) => {
      scope.setContext('component', {
        commandName: this.interaction.message?.interaction?.name,
        commandAuthor: this.commandAuthor.id,
        customId: this.interaction.data.customId,
      });

      try {
        Sentry.captureException(error);
        // eslint-disable-next-line no-empty
      } catch {}
    });

    return null;
  }
}
