import { IContextData } from '@utils/Types';
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  InteractionReplyOptions,
  Message,
  MessagePayload,
  TextBasedChannels,
  User,
} from 'discord.js-light';
import { TFunction } from 'i18next';
import MenheraClient from 'src/MenheraClient';
import { emojis, EmojiTypes } from '@structures/MenheraConstants';

export default class InteractionCommandContext {
  constructor(
    public client: MenheraClient,
    public interaction: CommandInteraction,
    public data: IContextData,
    public i18n: TFunction,
    private commandName: string,
  ) {}

  get options(): CommandInteractionOptionResolver {
    return this.interaction.options;
  }

  get channel(): TextBasedChannels {
    return this.interaction.channel as TextBasedChannels;
  }

  get author(): User {
    return this.interaction.user;
  }

  async defer(
    options?: MessagePayload | InteractionReplyOptions,
    ephemeral = false,
  ): Promise<void> {
    if (this.interaction.deferred && options) {
      await this.interaction.followUp(options).catch(() => null);
      return;
    }

    await this.interaction.deferReply({ ephemeral }).catch(() => null);
  }

  async reply(
    options: string | MessagePayload | InteractionReplyOptions,
    ephemeral = false,
  ): Promise<Message | void> {
    if (typeof options === 'string')
      return this.interaction
        .reply({
          content: options,
          ephemeral,
        })
        .catch(() => undefined);

    return this.interaction.reply(options).catch(() => undefined);
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

    return this.interaction.reply(options).catch(() => undefined);
  }

  async deferedReplyL(emoji: EmojiTypes, text: string, translateOptions = {}): Promise<void> {
    await this.interaction
      .editReply({
        content: `${emojis[emoji] || '🐛'} **|** ${this.i18n(text, translateOptions)}`,
      })
      .catch(() => undefined);
  }

  async replyL(
    emoji: EmojiTypes,
    text: string,
    translateOptions = {},
    ephemeral = false,
  ): Promise<Message | void> {
    return this.interaction
      .reply({
        content: `${emojis[emoji] || '🐛'} **|** ${this.i18n(text, translateOptions)}`,
        ephemeral,
      })
      .catch(() => undefined);
  }

  async replyT(
    emoji: EmojiTypes,
    text: string,
    translateOptions = {},
    ephemeral = false,
  ): Promise<Message | void> {
    return this.interaction
      .reply({
        content: `${emojis[emoji] || '🐛'} **|** ${this.translate(text, translateOptions)}`,
        ephemeral,
      })
      .catch(() => undefined);
  }

  async send(options: MessagePayload | InteractionReplyOptions): Promise<void> {
    await this.interaction.followUp(options).catch(() => undefined);
  }

  async deleteReply(): Promise<void> {
    return this.interaction.deleteReply().catch(() => undefined);
  }

  async editReply(options: MessagePayload | InteractionReplyOptions): Promise<void> {
    await this.interaction.editReply(options).catch(() => undefined);
  }

  locale(text: string, translateVars = {}): string {
    return this.i18n(text, translateVars);
  }

  translate(text: string, translateVars = {}): string {
    return this.i18n(`commands:${this.commandName}.${text}`, translateVars);
  }
}
