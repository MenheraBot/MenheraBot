import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';

import { TFunction } from 'i18next';
import { debugError } from '../../utils/debugError';
import { Translation } from '../../types/i18next';
import { EMOJIS } from '../../structures/constants';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
} from '../../utils/discord/interactionRequests';

export default class {
  constructor(
    private interactionToken: string,
    public commandId: string,
    private i18n: TFunction,
  ) {}

  async followUp(options: InteractionCallbackData): Promise<void> {
    await sendFollowupMessage(this.interactionToken, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: options,
    }).catch(debugError);
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${EMOJIS[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    await editOriginalInteractionResponse(this.interactionToken, options).catch(debugError);
  }
}
