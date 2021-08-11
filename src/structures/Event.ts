/* eslint-disable no-unused-vars */
import { Awaited } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class Event {
  public dir!: string;

  constructor(public client: MenheraClient) {}

  public run?(...args: unknown[]): Awaited<void>;
}
