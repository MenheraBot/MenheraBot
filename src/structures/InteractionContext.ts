import { IContextData } from '@utils/Types';
import {
  CommandInteraction,
  CommandInteractionOption,
  InteractionReplyOptions,
  Message,
  MessagePayload,
} from 'discord.js';
import { TFunction } from 'i18next';
import MenheraClient from 'MenheraClient';
import { emojis, EmojiTypes } from '@structures/MenheraConstants';

export default class InteractionCommandContext {
  constructor(
    public client: MenheraClient,
    public interaction: CommandInteraction,
    public args: ReadonlyArray<CommandInteractionOption>,
    public data: IContextData,
    public i18n: TFunction,
  ) {}

  async reply(
    options: string | MessagePayload | InteractionReplyOptions,
    ephemeral = false,
  ): Promise<Message | void> {
    if (typeof options === 'string')
      return this.interaction.reply({
        content: options,
        ephemeral,
      });

    return this.interaction.reply(options);
  }

  async replyE(
    emoji: EmojiTypes,
    options: string | MessagePayload | InteractionReplyOptions,
    ephemeral = false,
  ): Promise<Message | void> {
    if (typeof options === 'string')
      return this.interaction.reply({
        content: `${emojis[emoji] || '🐛'} **|** ${options}`,
        ephemeral,
      });

    return this.interaction.reply(options);
  }

  async replyT(
    emoji: EmojiTypes,
    text: string,
    translateOptions = {},
    ephemeral = false,
  ): Promise<Message | void> {
    return this.interaction.reply({
      content: `${emojis[emoji] || '🐛'} **|** ${this.i18n(text, translateOptions)}`,
      ephemeral,
    });
  }

  async send(options: MessagePayload | InteractionReplyOptions): Promise<void> {
    await this.interaction.followUp(options);
  }

  async deleteReply(): Promise<void> {
    return this.interaction.deleteReply();
  }

  async editReply(options: MessagePayload | InteractionReplyOptions): Promise<void> {
    await this.interaction.editReply(options);
  }

  locale(text: string, translateVars = {}): string {
    return this.i18n(text, translateVars);
  }
}
