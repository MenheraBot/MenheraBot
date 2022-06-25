/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client, ClientEvents, ClientOptions, Collection } from 'discord.js-light';
import { Client as ClusterClient } from 'discord-hybrid-sharding';

import * as Sentry from '@sentry/node';

import '@sentry/tracing';

import { IClientConfigs, IDatabaseRepositories } from '@custom_types/Menhera';
import FileUtil from '@utils/FileUtil';
import Event from '@structures/Event';
import Database from '@database/Databases';
import EventManager from '@structures/EventManager';

import InteractionCommand from '@structures/command/InteractionCommand';

import LocaleStructure from '@structures/LocaleStructure';
import VangoghWebSocket from '@structures/VangoghWebSocket';
import { debugError } from '@utils/Util';
import JogoDoBixoManager from '@structures/JogoDoBichoManager';
import { updateAssets } from '@structures/CdnManager';

export default class MenheraClient extends Client<true> {
  public cluster!: ClusterClient;

  public database: Database;

  public shardProcessEnded: boolean;

  public slashCommands: Collection<string, InteractionCommand>;

  public events: EventManager;

  public vangoghWs!: VangoghWebSocket;

  public cooldowns: Collection<string, Collection<string, number>>;

  public economyUsages: Set<string>;

  public jogoDoBichoManager!: JogoDoBixoManager;

  public shuttingDown: boolean;

  public interactionStatistics = {
    success: 0,
    failed: 0,
    catchedErrors: 0,
    received: 0,
  };

  constructor(options: ClientOptions, public config: IClientConfigs) {
    super(options);
    this.database = new Database(
      process.env.NODE_ENV === 'development'
        ? (process.env.DEV_DATABASE_URI as string)
        : (process.env.DATABASE_URI as string),
      process.env?.TESTING !== 'true',
    );
    this.slashCommands = new Collection();
    this.cooldowns = new Collection();
    this.economyUsages = new Set();
    this.events = new EventManager(this);
    this.config = config;
    this.shardProcessEnded = false;
    this.shuttingDown = false;
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
    this.vangoghWs = new VangoghWebSocket(this.cluster.id ?? 0);
    this.jogoDoBichoManager = new JogoDoBixoManager(this);

    await locales.load();
    await this.database.createConnection();
    this.loadSlashCommands(this.config.interactionsDirectory);
    this.loadEvents(this.config.eventsDirectory);
    await this.vangoghWs.connect().catch(debugError);
    await MenheraClient.updateCDNAssets();

    return true;
  }

  static async updateCDNAssets(): Promise<void> {
    console.log('[CDN] Updating assets...');
    const result = await updateAssets();
    console.log(`[CDN] ${result}`);
  }

  async getInteractionStatistics(): Promise<this['interactionStatistics']> {
    return (
      this.cluster
        // @ts-expect-error client n é sexual
        .broadcastEval((c: MenheraClient) => c.interactionStatistics)
        .then((a: this['interactionStatistics'][]) =>
          a.reduce(
            (p, c) => {
              p.catchedErrors += c.catchedErrors;
              p.failed += c.failed;
              p.received += c.received;
              p.success += c.success;
              return p;
            },
            { catchedErrors: 0, failed: 0, received: 0, success: 0 },
          ),
        )
    );
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
