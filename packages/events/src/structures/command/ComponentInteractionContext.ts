import * as Sentry from '@sentry/node';
import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';
import { User } from 'discordeno/transformers';
import i18next, { TFunction } from 'i18next';

import { AvailableLanguages, Translation } from '../../types/i18next.js';
import { ComponentInteraction } from '../../types/interaction.js';
import { logger } from '../../utils/logger.js';
import { EMOJIS, TOP_EMOJIS } from '../constants.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests.js';

export type CanResolve = 'users' | 'members' | false;

export default class<InteractionType extends ComponentInteraction = ComponentInteraction> {
  private replied = false;

  public i18n: TFunction;

  constructor(
    public interaction: InteractionType,
    public guildLocale: AvailableLanguages,
  ) {
    this.i18n = i18next.getFixedT(guildLocale);
  }

  get user(): User {
    return this.interaction.user;
  }

  get commandAuthor(): User {
    return this.interaction.message?.interaction?.user as User;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
  }

  get originalInteractionId(): bigint {
    return BigInt(this.interaction.data.customId.split('|')[2]);
  }

  get sentData(): string[] {
    return this.interaction.data.customId.split('|').slice(3);
  }

  // eslint-disable-next-line class-methods-use-this
  safeEmoji(emoji: keyof typeof EMOJIS, topEmojis?: boolean): string {
    return topEmojis ? TOP_EMOJIS[emoji as 'gods'] : EMOJIS[emoji];
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${this.safeEmoji(emoji)} **|** ${this.locale(text, translateOptions)}`;
  }

  async followUp(options: InteractionCallbackData): Promise<void> {
    await sendFollowupMessage(this.interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: options,
    }).catch((e) => this.captureException(e));
  }

  async respondWithModal(options: InteractionCallbackData): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.Modal,
      data: options,
    }).catch((e) => this.captureException(e));
  }

  async ack(): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.DeferredUpdateMessage,
    }).catch((e) => this.captureException(e));
  }

  async visibleAck(ephemeral: boolean): Promise<void> {
    if (this.replied) return;

    this.replied = true;

    await sendInteractionResponse(this.interaction.id, this.interaction.token, {
      type: InteractionResponseTypes.DeferredChannelMessageWithSource,
      data: {
        flags: ephemeral ? MessageFlags.EPHEMERAL : undefined,
      },
    }).catch((e) => this.captureException(e));
  }

  async respondInteraction(
    options: InteractionCallbackData & { attachments?: unknown[] },
  ): Promise<void> {
    if (!this.replied) {
      await sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: options,
      }).catch((e) => this.captureException(e));
      this.replied = true;
      return;
    }

    await editOriginalInteractionResponse(this.interaction.token, options).catch((e) =>
      this.captureException(e),
    );
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    if (!this.replied) {
      this.replied = true;
      await sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.UpdateMessage,
        data: options,
      }).catch((e) => this.captureException(e));
      return;
    }

    await editOriginalInteractionResponse(this.interaction.token, options).catch((e) =>
      this.captureException(e),
    );
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  captureException(error: Error): null {
    logger.error(this.interaction.data.customId, error.message);

    Sentry.withScope((scope) => {
      scope.setContext('component', {
        commandName: this.interaction.message?.interaction?.name,
        commandAuthor: this.commandAuthor.id,
        customId: this.interaction.data.customId,
      });

      try {
        Sentry.captureException(error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        logger.error('Error while sending the event', e?.message ?? e);
      }
    });

    return null;
  }
}
