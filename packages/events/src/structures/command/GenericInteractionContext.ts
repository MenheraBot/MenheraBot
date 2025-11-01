import { InteractionCallbackData, InteractionResponseTypes } from '@discordeno/bot';

import i18next, { TFunction } from 'i18next';
import { debugError } from '../../utils/debugError.js';
import { AvailableLanguages, Translation } from '../../types/i18next.js';
import { EMOJIS, TOP_EMOJIS } from '../constants.js';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
} from '../../utils/discord/interactionRequests.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';

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

  async makeLayoutMessage(
    options: Omit<InteractionCallbackData, 'embed' | 'content' | 'stickers' | 'poll'>,
  ) {
    options.flags = setComponentsV2Flag(options.flags ?? 0);
    return this.makeMessage(options);
  }

  async makeMessage(options: InteractionCallbackData): Promise<void> {
    await editOriginalInteractionResponse(this.interactionToken, options).catch(debugError);
  }
}
