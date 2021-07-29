import CommandContext from '@structures/CommandContext';
import { Message, MessageCollector, TextChannel } from 'discord.js';
import { IHotelItems, IInventoryItem, IMobLoot, TBruxaOptions } from './Types';

export default class PagesCollector extends MessageCollector {
  public ctx: CommandContext;

  public message: Message;

  public sent: Message;

  public invalidOption: null;

  public findOption: null;

  public handler: null;

  constructor(
    public channel: TextChannel,
    { ctx, sent }: { ctx: CommandContext; sent: Message },
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

  start(): this {
    this.on('collect', (msg) => this.onCollect(msg));
    return this;
  }

  setFindOption(fn): this {
    this.findOption = fn;
    return this;
  }

  setInvalidOption(fn): this {
    this.invalidOption = fn;
    return this;
  }

  setHandle(fn): this {
    this.collected.clear();
    this.handler = fn;
    return this;
  }

  async send(...args: Parameters<Message['edit']>): Promise<Message> {
    if (!this.sent || this.sent.deleted) {
      this.sent = await this.channel.send(args);
    } else {
      this.sent = await this.sent.edit(args);
    }

    return this.sent;
  }

  delete(options?: { timeout?: number; reason?: string }): void {
    const original = this.sent;
    if (original && !original.deleted) {
      original.delete(options);
    }
  }

  async replyT(...args: Parameters<CommandContext['replyT']>): Promise<Message> {
    const sent = await this.ctx.replyT(...args);
    this.delete();
    this.sent = sent;
    return this.sent;
  }

  async onCollect(message: Message): Promise<undefined | void> {
    const option = this.findOption(message.content);

    if (!option) {
      this.finish();
      return this.invalidOption(message, this);
    }

    const res = this.handler(message, option, this);
    if (res !== 'CONTINUE') {
      this.finish();
    }
  }

  /**
   * Stop collector listener
   */
  finish(): void {
    return this.stop('finish');
  }

  static arrFindByElemOrIndex(arr: Array<TBruxaOptions>) {
    return (str: TBruxaOptions): TBruxaOptions | undefined =>
      arr.find((elem, i) => elem === str?.toLowerCase() || i + 1 === Number(str));
  }

  static arrFindByItemNameOrIndex(items: Array<IMobLoot | IInventoryItem>) {
    return (str: string): IMobLoot | IInventoryItem | undefined =>
      items.find(
        (item, i) => item.name.toLowerCase() === str?.toLowerCase() || i + 1 === Number(str),
      );
  }

  static arrFindByIndex(arr: Array<IHotelItems>) {
    return (str: string): IHotelItems | undefined =>
      arr.find((_: IHotelItems, i: number) => i + 1 === Number(str));
  }

  static continue(): string {
    return 'CONTINUE';
  }
}
