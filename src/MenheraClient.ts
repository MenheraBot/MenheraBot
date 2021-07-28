/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import { Client, Collection, ShardClientUtil } from 'discord.js';

import Sentry from '@sentry/node';
import i18next from 'i18next';

import '@sentry/tracing';

import EventManager from './structures/EventManager';

import Command from './structures/Command';

import Database from './database/MongoDatabase';
import { IClientConfigs, ICommandConfig } from './utils/Types';
import LocaleStructure from './structures/LocaleStructure';
import FileUtil from './utils/FileUtil';

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

  get repositories() {
    return this.database.repositories;
  }

  async init() {
    Sentry.init({
      dsn: process.env.SENTRY_DNS,
      environment: process.env.NODE_ENV,
      serverName: 'MenheraVPS',
      tracesSampleRate: 1.0,
    });

    const locales = new LocaleStructure();

    await locales.load();
    await this.database.createConnection();
    await this.loadCommands(this.config.commandsDirectory);
    await this.loadEvents(this.config.eventsDirectory);
    return true;
  }

  async reloadCommand(commandName: string) {
    const command =
      this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName) as string);
    if (!command) return false;

    return FileUtil.reloadFile<typeof Command>(command.dir, (cmd) =>
      this.loadCommand(cmd, command.dir),
    );
  }

  login(token: string) {
    return super.login(token);
  }

  async postExistingCommand(command: ICommandConfig) {
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
      this.repositories.commandRepository.create(command.name, data);
    }
  }

  async loadCommand(NewCommand: typeof Command, filepath: string) {
    // @ts-expect-error
    const command: Command = new NewCommand(this);

    command.dir = filepath;

    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config?.aliases.forEach((a: string) => this.aliases.set(a, command.config.name));

    const cmdInDb = await this.repositories.cmdRepository.findByName(command.config.name);
    if (!cmdInDb) {
      this.repositories.cmdRepository.create(command.config.name);
    }

    if (command.config.category !== 'Dev') {
      this.postExistingCommand(command.config);
    }
  }

  loadCommands(directory: string) {
    // @ts-ignore
    return FileUtil.readDirectory(directory, (...args) => this.loadCommand(...args));
  }

  loadEvents(directory: string) {
    // @ts-ignore
    return FileUtil.readDirectory(directory, (Event: any, filepath: string) => {
      this.events.add(FileUtil.filename(filepath), filepath, new Event(this));
    });
  }
}
