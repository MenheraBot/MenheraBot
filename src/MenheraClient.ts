import { Client, Collection, ShardClientUtil } from 'discord.js';

import Sentry from '@sentry/node';
import i18next from 'i18next';

import '@sentry/tracing';

import { IClientConfigs, ICommandConfig, IDatabaseRepositories, IEvent } from '@utils/Types';
import FileUtil from '@utils/FileUtil';
import EventManager from './structures/EventManager';

import Command from './structures/Command';

import Database from './database/MongoDatabase';
import LocaleStructure from './structures/LocaleStructure';

export default class MenheraClient extends Client {
  public database: Database;

  public commands: Collection<string, Command>;

  public aliases: Collection<string, string>;

  public events: EventManager;

  // shard is always present when using the ShardingManager
  public shard!: ShardClientUtil;

  constructor(options = {}, public config: IClientConfigs) {
    super(options);

    this.database = new Database(
      process.env.NODE_ENV === 'development'
        ? (process.env.DEV_DATABASE_URI as string)
        : (process.env.DATABASE_URI as string),
    );
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new EventManager(this);
    this.config = config;
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
    this.loadCommands(this.config.commandsDirectory);
    this.loadEvents(this.config.eventsDirectory);
    return true;
  }

  async reloadCommand(commandName: string): Promise<void | false> {
    const command =
      this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName) as string);
    if (!command) return false;

    await FileUtil.reloadFile<typeof Command>(command.dir, (cmd) =>
      this.loadCommand(cmd, command.dir),
    );
  }

  login(token: string): Promise<string> {
    return super.login(token);
  }

  async postExistingCommand(command: ICommandConfig): Promise<void> {
    const tPt = i18next.getFixedT('pt-BR');
    const tUs = i18next.getFixedT('en-US');

    const exists = await this.repositories.commandRepository.findByName(command.name);

    const data = {
      category: command.category,
      ptDescription: tPt(`commands:${command.name}.description`),
      ptUsage: tPt(`commands:${command.name}.usage`),
      usDescription: tUs(`commands:${command.name}.description`),
      usUsage: tUs(`commands:${command.name}.usage`),
    };

    if (exists) {
      this.repositories.commandRepository.updateByName(command.name, data);
    } else {
      await this.repositories.commandRepository.create(command.name, data);
    }
  }

  async loadCommand(NewCommand: typeof Command, filepath: string): Promise<void> {
    // @ts-expect-error Abstract class cannot be invoked
    const command: Command = new NewCommand(this);

    command.dir = filepath;

    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config?.aliases.forEach((a: string) => this.aliases.set(a, command.config.name));

    const cmdInDb = await this.repositories.cmdRepository.findByName(command.config.name);
    if (!cmdInDb) {
      await this.repositories.cmdRepository.create(command.config.name);
    }

    if (command.config.category !== 'Dev') {
      await this.postExistingCommand(command.config);
    }
  }

  loadCommands(directory: string): void {
    FileUtil.readDirectory(directory, async (cmd: typeof Command, filepath: string) => {
      await this.loadCommand(cmd, filepath);
    });
  }

  loadEvents(directory: string): void {
    FileUtil.readDirectory(directory, (Event: IEvent, filepath: string) => {
      this.events.add(FileUtil.filename(filepath), filepath, new Event(this));
    });
  }
}
