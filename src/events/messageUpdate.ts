import { Message } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class MessageUpdate {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  run(oldMessage: Message, newMessage: Message) {
    if (oldMessage.content === newMessage.content) return;
    this.client.emit('message', newMessage);
  }
}
