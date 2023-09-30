import { InteractionCallbackData, InteractionResponseTypes } from 'discordeno';

import { bot } from '../../index';
import { debugError } from '../../utils/debugError';

export default class {
  constructor(private interactionToken: string, public commandId: string) {}

  async followUp(options: InteractionCallbackData): Promise<void> {
    await bot.helpers
      .sendFollowupMessage(this.interactionToken, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: options,
      })
      .catch(debugError);
  }

  async makeMessage(options: InteractionCallbackData & { attachments?: unknown[] }): Promise<void> {
    await bot.helpers
      .editOriginalInteractionResponse(this.interactionToken, options)
      .catch(debugError);
  }
}
