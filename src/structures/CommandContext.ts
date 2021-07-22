import { IContextData } from '@utils/Types';
import { Message, MessageOptions } from 'discord.js';
import { TFunction } from 'i18next';
import MenheraClient from 'MenheraClient';
import { emojis } from '@structures/MenheraConstants';

export default class CommandContext {
  constructor(
    public client: MenheraClient,
    public message: Message,
    public args: string[],
    public data: IContextData,
    public i18n: TFunction,
  ) {
    this.client = client;
    this.message = message;
    this.args = args;
    this.data = data;
    this.i18n = i18n;
  }

  async replyT(emoji: typeof emojis, text: string, translateOptions = {}) {
    return this.message.channel.send(
      `${this.client.constants.emojis[emoji] || '🐛'} **|** ${this.message.author}, ${this.i18n(
        text,
        translateOptions,
      )}`,
    );
  }

  async reply(emoji: typeof emojis, text: string) {
    return this.message.channel.send(
      `${this.client.constants.emojis[emoji] || '🐛'} **|** ${this.message.author}, ${text}`,
    );
  }

  async send(message: string) {
    return this.message.channel.send(message);
  }

  async sendC(content: string, config: MessageOptions) {
    return this.message.channel.send(content, config);
  }

  locale(text: string, translateVars = {}) {
    return this.i18n(text, translateVars);
  }
}
