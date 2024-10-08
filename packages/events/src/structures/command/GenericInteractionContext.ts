import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';

import i18next, { TFunction } from 'i18next';
import { debugError } from '../../utils/debugError';
import { AvailableLanguages, Translation } from '../../types/i18next';
import { EMOJIS, TOP_EMOJIS } from '../constants';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
} from '../../utils/discord/interactionRequests';

export default class {
  private i18n: TFunction;

  constructor(
    private interactionToken: string,
    public originalInteractionId: string,
    public guildLocale: AvailableLanguages,
  ) {
    this.i18n = i18next.getFixedT(guildLocale);
  }

  async followUp(data: InteractionCallbackData): Promise<void> {
    await sendFollowupMessage(this.interactionToken, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data,
    }).catch(debugError);
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  // eslint-disable-next-line class-methods-use-this
  safeEmoji(emoji: keyof typeof EMOJIS, topEmojis?: boolean): string {
    return topEmojis ? TOP_EMOJIS[emoji as 'gods'] : EMOJIS[emoji];
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${this.safeEmoji(emoji) || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    await editOriginalInteractionResponse(this.interactionToken, options).catch(debugError);
  }
}
