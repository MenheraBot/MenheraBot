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
    public interaction: CommandInteraction & { client: MenheraClient },
    public i18n: TFunction,
    public data: IContextData,
    private commandName: string,
  ) {}

  get client(): MenheraClient {
    return this.interaction.client;
  }

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

  prettyResponseLocale(emoji: EmojiTypes, text: string, translateOptions = {}): string {
    return `${emojis[emoji] || '🐛'} **|** ${this.locale(text, translateOptions)}`;
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
    if (this.interaction.replied || this.interaction.deferred)
      return this.resolveMessage(await this.interaction.editReply(options).catch(() => null));

    return this.resolveMessage(
      await this.interaction.reply({ ...options, fetchReply: true }).catch(() => null),
    );
  }

  async send(options: MessagePayload | InteractionReplyOptions): Promise<Message | null> {
    return this.resolveMessage(await this.interaction.followUp(options).catch(() => null));
  }

  async deleteReply(): Promise<void> {
    return this.interaction.deleteReply().catch(() => undefined);
  }

  locale(text: string, translateVars = {}): string {
    return this.i18n(text, translateVars);
  }

  translate(text: string, translateVars = {}): string {
    return this.i18n(`commands:${this.commandName}.${text}`, translateVars);
  }
}
