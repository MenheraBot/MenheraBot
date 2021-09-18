/* eslint-disable no-unused-vars */
import { Awaited } from 'discord.js-light';
import MenheraClient from 'src/MenheraClient';

export default class Event {
  constructor(public client: MenheraClient) {}

  public run?(...args: unknown[]): Awaited<void>;
}
