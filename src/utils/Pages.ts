import CommandContext from '@structures/CommandContext';
import { Message, MessageCollector, TextChannel } from 'discord.js';

/**
 * returns the function when the first argument is not
 * @param {any} fn
 * @returns {Function}
 */
const func = (fn) => (typeof fn === 'function' ? fn : () => fn);

export default class PagesCollector extends MessageCollector {
  public ctx: CommandContext;

  public message: Message;

  public sent: Message;

  public invalidOption;

  public findOption;

  public handler;

  constructor(
    public channel: TextChannel,
    { ctx, sent },
    public collectorOptions = { max: 5, time: 60000 },
  ) {
    super(channel, (m) => m.author.id === ctx.message.author.id, collectorOptions);
    this.ctx = ctx;
    this.message = ctx.message;
    this.sent = sent;
    this.invalidOption = null;
    this.findOption = null;
    this.handler = null;
  }

  start() {
    this.on('collect', (msg) => this.onCollect(msg));
    return this;
  }

  setFindOption(fn) {
    this.findOption = fn;
    return this;
  }

  setInvalidOption(fn) {
    this.invalidOption = fn;
    return this;
  }

  setHandle(fn) {
    this.collected.clear();
    this.handler = fn;
    return this;
  }

  /**
   * Send a new page message or edit the current
   * @param  {...any} args arguments of #TextChannel.send or #Message.edit
   */
  async send(...args) {
    if (!this.sent || this.sent.deleted) {
      this.sent = await this.channel.send(args);
    } else {
      this.sent = await this.sent.edit(args);
    }

    return this.sent;
  }

  delete(options?: { timeout?: number; reason?: string }) {
    const original = this.sent;
    if (original && !original.deleted) {
      original.delete(options);
    }
  }

  async replyT(...args: Parameters<CommandContext['replyT']>) {
    const sent = await this.ctx.replyT(...args);
    this.delete();
    this.sent = sent;
    return this.sent;
  }

  async onCollect(message: Message) {
    const option = await func(this.findOption)(message.content);

    if (!option) {
      this.finish();
      return func(this.invalidOption)(message, this);
    }

    const res = await func(this.handler)(message, option, this);
    if (res !== 'CONTINUE') {
      this.finish();
    }
  }

  /**
   * Stop collector listener
   */
  finish() {
    return this.stop('finish');
  }

  static arrFindByElemOrIndex(arr) {
    return (str) => arr.find((elem, i) => elem === str?.toLowerCase() || i + 1 === Number(str));
  }

  static arrFindByItemNameOrIndex(items) {
    return (str) =>
      items.find(
        (item, i) =>
          (item?.name ?? item?.id).toLowerCase() === str?.toLowerCase() || i + 1 === Number(str),
      );
  }

  static arrFindByIndex(arr: any[]) {
    return (str: any) => arr.find((_: any, i: number) => i + 1 === Number(str));
  }

  static continue() {
    return 'CONTINUE';
  }
}
