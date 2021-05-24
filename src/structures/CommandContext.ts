import { Message } from 'discord.js';
import { TFunction } from 'i18next';
import emotes from './emotes';

// TODO: Interfaces to User and Server
interface IContextData {
user
server
}
type availableEmojis = typeof emotes

export default class CommandContext {
  public client;

  public message: Message;

  public args: Array<string>;

  public data: IContextData;

  private i18n: TFunction;

  constructor(client, message: Message, args: Array<string>, data: IContextData, i18n: TFunction) {
    this.client = client;
    this.message = message;
    this.args = args;
    this.data = data;
    this.i18n = i18n;
  }

  async menheraReplyT(emoji: availableEmojis, text: string, translateOptions = {}): Promise<Message> {
    return this.message.channel.send(`${emotes[emoji] || '🐛'} **|** ${this.message.author}, ${this.i18n(text, translateOptions)}`);
  }

  async menheraReply(emoji: availableEmojis, text: string): Promise<Message> {
    return this.message.channel.send(`${emotes[emoji] || '🐛'} **|** ${this.message.author}, ${text}`);
  }

  async send(whatToSend: any): Promise<Message> {
    return this.message.channel.send(whatToSend);
  }
}
