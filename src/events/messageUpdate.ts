import { Message } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';

export default class MessageUpdate extends Event {
  constructor(public client: MenheraClient) {
    super(client);
  }

  async run(oldMessage: Message, newMessage: Message): Promise<void> {
    if (oldMessage.content === newMessage.content) return;
    this.client.emit('messageCreate', newMessage);
  }
}
