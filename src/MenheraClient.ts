import { Client, ClientEvents, ClientOptions, Collection } from 'discord.js';

import * as Sentry from '@sentry/node';

import '@sentry/tracing';

import { IClientConfigs, IDatabaseRepositories } from '@utils/Types';
import FileUtil from '@utils/FileUtil';
import Event from '@structures/Event';
import Database from '@database/Databases';
import EventManager from '@structures/EventManager';

import Command from '@structures/command/Command';
import InteractionCommand from '@structures/command/InteractionCommand';

import LocaleStructure from '@structures/LocaleStructure';

export default class MenheraClient extends Client {
  public database: Database;

  public commands: Collection<string, Command>;

  public slashCommands: Collection<string, InteractionCommand>;

  public aliases: Collection<string, string>;

  public events: EventManager;

  public cooldowns: Collection<string, Collection<string, number>>;

  constructor(options: ClientOptions, public config: IClientConfigs) {
    super(options);

    this.database = new Database(
      process.env.NODE_ENV === 'development'
        ? (process.env.DEV_DATABASE_URI as string)
        : (process.env.DATABASE_URI as string),
      process.env.NODE_ENV !== 'development',
    );
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.aliases = new Collection();
    this.cooldowns = new Collection();
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
    this.loadSlashCommands(this.config.interactionsDirectory);
    this.loadEvents(this.config.eventsDirectory);
    return true;
  }

  async reloadCommand(commandName: string): Promise<void | false> {
    const command = this.slashCommands.get(commandName);

    if (!command) return false;

    await FileUtil.reloadFile<typeof InteractionCommand>(command.dir, (cmd) =>
      this.loadSlashCommand(cmd, command.dir),
    );
  }

  login(token: string): Promise<string> {
    return super.login(token);
  }

  /* async postExistingCommand(command: ICommandConfig): Promise<void> {
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
      await this.repositories.commandRepository.updateByName(command.name, data);
    } else {
      await this.repositories.commandRepository.create(command.name, data);
    }
  } */

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
      this.events.add(
        FileUtil.filename(filepath) as keyof ClientEvents,
        filepath,
        new EventFile(this),
      );
    });
  }
}
