import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';
import { ClientEvents } from 'discord.js-light';

export default class EventManager {
  constructor(private client: MenheraClient) {}

  add(name: keyof ClientEvents, event: Event): void {
    if (!event.run) return;
    event.run = event.run.bind(event);
    this.client.on(name, event.run);
  }
}
