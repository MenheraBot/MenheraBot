import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';

import { TFunction } from 'i18next';
import { debugError } from '../../utils/debugError';
import { Translation } from '../../types/i18next';
import { EMOJIS } from '../../structures/constants';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
} from '../../utils/discord/interactionRequests';
import { MessageFlags } from '../../utils/discord/messageUtils';

export default class {
  constructor(public tokens: string[], public commandId: string, private i18n: TFunction) {}

  async followUp(options: InteractionCallbackData): Promise<void> {
    await Promise.all(
      this.tokens.map((token) =>
        sendFollowupMessage(token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: { ...options, flags: MessageFlags.EPHEMERAL },
        }).catch(debugError),
      ),
    );
  }

  locale(text: Translation, options: Record<string, unknown> = {}): string {
    return this.i18n(text, options);
  }

  prettyResponse(emoji: keyof typeof EMOJIS, text: Translation, translateOptions = {}): string {
    return `${EMOJIS[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    await Promise.all(
      this.tokens.map((token) =>
        editOriginalInteractionResponse(token, { ...options, flags: MessageFlags.EPHEMERAL }).catch(
          debugError,
        ),
      ),
    );
  }
}
