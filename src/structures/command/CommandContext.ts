import { IContextData } from '@utils/Types';
import { Message, MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { TFunction } from 'i18next';
import MenheraClient from 'MenheraClient';
import { emojis, EmojiTypes } from '@structures/MenheraConstants';

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

  async replyT(emoji: EmojiTypes, text: string, translateOptions = {}): Promise<Message> {
    return this.message.channel.send(
      `${emojis[emoji] || '🐛'} **|** ${this.message.author}, ${this.i18n(text, translateOptions)}`,
    );
  }

  async reply(emoji: EmojiTypes, text: string): Promise<Message> {
    return this.message.channel.send(
      `${emojis[emoji] || '🐛'} **|** ${this.message.author}, ${text}`,
    );
  }

  async send(
    message: string | MessageEmbed | (MessageOptions & { files?: MessageAttachment[] | [null] }),
  ): Promise<Message> {
    if (typeof message === 'string')
      return this.message.channel.send({
        content: message,
        reply: { messageReference: this.message },
      });
    if (message instanceof MessageEmbed)
      return this.message.channel.send({
        embeds: [message],
        reply: { messageReference: this.message },
      });
    return this.message.channel.send({
      reply: { messageReference: this.message },
      ...message,
    });
  }

  async sendC(
    content: string,
    config: (MessageOptions & { files?: MessageAttachment[] | [null] }) | MessageEmbed,
  ): Promise<Message> {
    if (config instanceof MessageEmbed) {
      return this.message.channel.send({ content, embeds: [config] });
    }
    return this.message.channel.send({
      content,
      ...config,
      reply: { messageReference: this.message },
    });
  }

  locale(text: string, translateVars = {}): string {
    return this.i18n(text, translateVars);
  }
}
