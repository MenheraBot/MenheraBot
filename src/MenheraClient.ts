/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import { Client, Collection } from 'discord.js';

import Sentry from '@sentry/node';
import i18next from 'i18next';

import '@sentry/tracing';

import EventManager from './structures/EventManager';

import Command from './structures/command';

import Database from './database/MongoDatabase';
import { IClientConfigs, ICommandConfig } from './utils/Types';
import Constants from './structures/MenheraConstants';
import RpgChecks from './structures/Rpgs/checks';
import LocaleStructure from './structures/LocaleStructure';
import ShardManager from './structures/ShardManager';
import FileUtil from './utils/FileUtil';

export default class MenheraClient extends Client {
  public database: Database;

  public commands: Collection<string, Command>;

  public aliases: Collection<string, string>;

  public events: EventManager;

  public constants: typeof Constants;

  public rpgChecks: typeof RpgChecks;

  public shardManager: ShardManager;

  constructor(options = {}, public config: IClientConfigs) {
    super(options);

    this.database = new Database(
      process.env.NODE_ENV === 'development'
        ? process.env.DEV_DATABASE_URI
        : process.env.DATABASE_URI,
    );
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new EventManager(this);
    this.config = config;
    this.constants = Constants;
    this.rpgChecks = RpgChecks;
    this.shardManager = new ShardManager(this);
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
      this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
    if (!command) return false;
    return FileUtil.reloadFile(command.dir, (cmd: Command) => this.loadCommand(cmd, command.dir));
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

  async loadCommand(NewCommand, filepath: string) {
    const command = new NewCommand(this);

    command.dir = filepath;

    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config.aliases.forEach((a: string) => this.aliases.set(a, command.config.name));

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
