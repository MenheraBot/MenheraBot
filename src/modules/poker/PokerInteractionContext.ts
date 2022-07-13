import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageComponentInteraction,
  MessagePayload,
  ModalSubmitInteraction,
  User,
} from 'discord.js-light';
import { TFunction } from 'i18next';
import MenheraClient from 'MenheraClient';
import { emojis, EmojiTypes } from '@structures/Constants';
import { debugError, MayNotExists } from '@utils/Util';

import { Translation } from '../../types/i18next';

export default class PokerInteractionContext {
  constructor(
    private innerInteraction:
      | (CommandInteraction & { client: MenheraClient })
      | MessageComponentInteraction,
    public i18n: TFunction,
  ) {}

  get interaction():
    | (CommandInteraction & { client: MenheraClient })
    | MessageComponentInteraction {
    return this.innerInteraction;
  }

  public updateInteraction(interaction: MessageComponentInteraction) {
    this.innerInteraction = interaction;
  }

  get author(): User {
    return this.interaction.user;
  }

  async awaitModalResponse(
    time = 25_000,
    defer = true,
  ): Promise<MayNotExists<ModalSubmitInteraction>> {
    return this.interaction
      .awaitModalSubmit({
        filter: (int) => int.customId.startsWith(this.interaction.id),
        time,
      })
      .then((interaction) => {
        if (defer) interaction.deferUpdate();
        return interaction;
      })
      .catch(() => null);
  }

  prettyResponse(emoji: EmojiTypes, text: Translation, translateOptions = {}): string {
    return `${emojis[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
  }

  async makeMessage(options: InteractionReplyOptions): Promise<void> {
    if (this.interaction.replied || this.interaction.deferred) {
      await this.interaction.editReply(options).catch(debugError);
      return;
    }
    await this.interaction.reply(options).catch(debugError);
  }

  async send(options: MessagePayload | InteractionReplyOptions): Promise<void> {
    await this.interaction.followUp(options).catch(debugError);
  }

  async deleteReply(): Promise<void> {
    await this.interaction.deleteReply().catch(debugError);
  }

  locale(text: Translation, translateVars = {}): string {
    return this.i18n(text, {
      ...translateVars,
      // context: this.data.server.uncensored ? 'uncensored' : null, -- THIS IS FOR UNCENSORED FUTURE OPTION
    });
  }
}
