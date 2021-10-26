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
import MenheraClient from 'MenheraClient';
import { emojis, EmojiTypes } from '@structures/Constants';
// eslint-disable-next-line import/no-extraneous-dependencies
import { APIMessage } from 'discord-api-types';

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
      await this.send(options);
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
      return this.interaction
        .reply({
          content: `${emojis[emoji] || '🐛'} **|** ${options}`,
          ephemeral,
        })
        .catch(() => undefined);

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

  prettyResponse(emoji: EmojiTypes, text: string, translateOptions = {}): string {
    return `${emojis[emoji] || '🐛'} **|** ${this.translate(text, translateOptions)}`;
  }

  private resolveMessage(message: Message | APIMessage | null): Message | null {
    if (!message) return null;
    if (message instanceof Message) return message;
    // @ts-expect-error Message constructor is private
    return new Message(this.client, message);
  }

  async makeMessage(options: InteractionReplyOptions): Promise<Message | null> {
    if (this.interaction.replied)
      return this.resolveMessage(await this.interaction.editReply(options).catch(() => null));

    return this.resolveMessage(
      await this.interaction.reply({ ...options, fetchReply: true }).catch(() => null),
    );
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
