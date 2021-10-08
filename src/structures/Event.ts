/* eslint-disable no-unused-vars */
import { Awaitable } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export default class Event {
  constructor(public client: MenheraClient) {}

  public run?(...args: unknown[]): Awaitable<void>;
}
