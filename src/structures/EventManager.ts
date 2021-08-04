/* eslint-disable no-unused-vars */
import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';
import { ClientEvents } from 'discord.js';

export default class EventManager {
  public events: Map<string, Event>;

  constructor(public client: MenheraClient) {
    this.client = client;
    this.events = new Map();
  }

  add(name: keyof ClientEvents, filepath: string, event: Event): void {
    event.dir = filepath;
    if (!event.run) return;
    event.run = event.run.bind(event);
    this.client.on(name, event.run);
    this.events.set(name, event);
  }
}
