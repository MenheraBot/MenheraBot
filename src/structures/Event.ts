import { Awaitable } from 'discord.js-light';

export default class Event {
  public run?(...args: unknown[]): Awaitable<void>;
}
