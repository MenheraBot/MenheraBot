/* eslint-disable no-unused-vars */
import { IEvent } from '@utils/Types';
import MenheraClient from 'MenheraClient';

export default class EventManager {
  public events: Map<string, IEvent>;

  constructor(public client: MenheraClient) {
    this.client = client;
    this.events = new Map();
  }

  add(name: string, filepath: string, event: IEvent) {
    event.dir = filepath;
    event.run = event.run.bind(event);
    this.client.on(name, event.run);
    this.events.set(name, event);
  }
}
