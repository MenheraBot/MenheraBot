import { InteractionResponseTypes, InteractionCallbackData } from 'discordeno';
import { Interaction, User } from 'discordeno/transformers';
import * as Sentry from '@sentry/node';
import { TFunction } from 'i18next';

import { logger } from '../../utils/logger';
import { EMOJIS } from '../constants';
import { Translation } from '../../types/i18next';
import { bot } from '../../index';

export type CanResolve = 'users' | 'members' | false;

export default class {
  constructor(public interaction: Interaction, public i18n: TFunction) {}

  get author(): User {
    return this.interaction.user;
  }

  get channelId(): bigint {
    return this.interaction.channelId ?? 0n;
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
      .catch(this.captureException.bind(this));
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    await bot.helpers
      .sendInteractionResponse(this.interaction.id, this.interaction.token, {
        type: InteractionResponseTypes.UpdateMessage,
        data: options,
      })
      .catch(this.captureException.bind(this));
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  captureException(error: Error): null {
    if (process.env.NODE_ENV === 'DEVELOPMENT') logger.error(error.message);

    Sentry.withScope((scope) => {
      scope.setContext('command', {
        name: this.interaction.data?.name,
      });

      Sentry.captureException(error);
    });

    return null;
  }
}
