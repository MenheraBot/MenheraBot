import { Awaitable } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export default abstract class Event {
  constructor(public client: MenheraClient) {}

  public abstract run?(...args: unknown[]): Awaitable<void>;
}
