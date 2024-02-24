import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';

import i18next, { TFunction } from 'i18next';
import { debugError } from '../../utils/debugError';
import { AvailableLanguages, Translation } from '../../types/i18next';
import { EMOJIS } from '../constants';
import {
  editOriginalInteractionResponse,
  sendFollowupMessage,
} from '../../utils/discord/interactionRequests';
import { injectRoleplayWarnIfNeeded } from './ChatInputInteractionContext';

export default class {
  public i18n: TFunction;

  constructor(
    public interactionToken: string,
    public commandId: string,
    public guildLocale: AvailableLanguages,
  ) {
    this.i18n = i18next.getFixedT(guildLocale);
  }

  async followUp(options: InteractionCallbackData): Promise<void> {
    await injectRoleplayWarnIfNeeded(this, options);

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
    await injectRoleplayWarnIfNeeded(this, options);

    await editOriginalInteractionResponse(this.interactionToken, options).catch(debugError);
  }
}
