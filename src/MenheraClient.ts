/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client, ClientEvents, ClientOptions, Collection } from 'discord.js-light';

import * as Sentry from '@sentry/node';

import '@sentry/tracing';

import { IClientConfigs, IDatabaseRepositories } from '@utils/Types';
import FileUtil from '@utils/FileUtil';
import Event from '@structures/Event';
import Database from '@database/Databases';
import EventManager from '@structures/EventManager';

import InteractionCommand from '@structures/command/InteractionCommand';

import LocaleStructure from '@structures/LocaleStructure';
import PicassoWebSocket from '@structures/PicassoWebSocket';
import { debugError } from '@utils/Util';
import JogoDoBixoManager from '@structures/JogoDoBichoManager';

export default class MenheraClient extends Client {
  public database: Database;

  public shardProcessEnded: boolean;

  public slashCommands: Collection<string, InteractionCommand>;

  public events: EventManager;

  public picassoWs: PicassoWebSocket;

  public cooldowns: Collection<string, Collection<string, number>>;

  public commandExecutions: Set<string>;

  public jogoDoBichoManager: JogoDoBixoManager;

  public shuttingDown: boolean;

  constructor(options: ClientOptions, public config: IClientConfigs) {
    super(options);

    this.database = new Database(
      process.env.NODE_ENV === 'development'
        ? (process.env.DEV_DATABASE_URI as string)
        : (process.env.DATABASE_URI as string),
      process.env.NODE_ENV !== 'development',
    );
    this.slashCommands = new Collection();
    this.cooldowns = new Collection();
    this.commandExecutions = new Set();
    this.events = new EventManager(this);
    this.config = config;
    this.picassoWs = new PicassoWebSocket(this.shard?.ids[0] ?? 0);
    this.shardProcessEnded = false;
    this.shuttingDown = false;
    this.jogoDoBichoManager = new JogoDoBixoManager(this);
  }

  get repositories(): IDatabaseRepositories {
    return this.database.repositories;
  }

  async init(): Promise<true> {
    Sentry.init({
      dsn: process.env.SENTRY_DNS,
      environment: process.env.NODE_ENV,
      serverName: 'MenheraVPS',
      tracesSampleRate: 1.0,
    });

    const locales = new LocaleStructure();

    await locales.load();
    await this.database.createConnection();
    this.loadSlashCommands(this.config.interactionsDirectory);
    this.loadEvents(this.config.eventsDirectory);
    this.picassoWs.connect().catch(debugError);
    return true;
  }

  async reloadCommand(commandName: string): Promise<void | false> {
    const command = this.slashCommands.get(commandName);

    if (!command) return false;

    await FileUtil.reloadFile<typeof InteractionCommand>(command.dir, (cmd) =>
      this.loadSlashCommand(cmd, command.dir),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async reloadLocales(): Promise<void> {
    const locale = new LocaleStructure();
    locale.reload();
  }

  login(token: string): Promise<string> {
    return super.login(token);
  }

  async loadSlashCommand(NewCommand: typeof InteractionCommand, filepath: string): Promise<void> {
    // @ts-expect-error Abstract class cannot be invoked
    const command: InteractionCommand = new NewCommand(this);

    command.dir = filepath;

    this.slashCommands.set(command.config.name, command);

    const cmdInDb = await this.repositories.cmdRepository.findByName(command.config.name);
    if (!cmdInDb) {
      await this.repositories.cmdRepository.create(command.config.name);
    }
  }

  loadSlashCommands(directory: string): void {
    FileUtil.readDirectory<typeof InteractionCommand>(
      directory,
      async (cmd: typeof InteractionCommand, filepath: string) => {
        await this.loadSlashCommand(cmd, filepath);
      },
    );
  }

  loadEvents(directory: string): void {
    FileUtil.readDirectory(directory, (EventFile: typeof Event, filepath: string) => {
      this.events.add(FileUtil.filename(filepath) as keyof ClientEvents, new EventFile());
    });
  }
}
