/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import { Client, Collection } from 'discord.js';
import * as Sentry from '@sentry/node';
import i18next from 'i18next';
import Command from '@structures/command';

import EventManager from '@structures/EventManager';
import Database from '@structures/DatabaseConnection';
import Constants from '@structures/MenheraConstants';
import RpgChecks from '@structures/Rpgs/checks';
import LocaleStructure from '@structures/LocaleStructure';
import ShardManager from '@structures/ShardManager';
import FileUtil from '@utils/FileUtil';
import Reminders from '@utils/RemindersChecks';
import { MenheraConfig } from '@interfaces/MenheraClient';
import Repositories from './repositories/repositories';

export default class MenheraClient extends Client {
  database: typeof Database;

  repositories: typeof Repositories;

  config: MenheraConfig;

  constants: typeof Constants;

  rpgChecks: typeof RpgChecks;

  commands: Collection<string, Command>;

  aliases: Collection<string, string>;

  events: EventManager;

  shardManager: ShardManager;

  constructor(options = {}, config: MenheraConfig) {
    super(options);

    this.database = Database;
    this.repositories = Repositories;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new EventManager(this);
    this.config = config;
    this.constants = Constants;
    this.rpgChecks = RpgChecks;
    this.shardManager = new ShardManager(this);
  }

  async init() {
    if (this.config.sentry_dns) {
      Sentry.init({ dsn: this.config.sentry_dns });
    }

    const locales = new LocaleStructure();
    const reminder = new Reminders(this);

    reminder.loop();
    await locales.load();

    await this.loadCommands(this.config.commandsDirectory);
    await this.loadEvents(this.config.eventsDirectory);
    return true;
  }

  async reloadCommand(commandName: string) {
    const command = this.commands.get(commandName)
      || this.commands.get(this.aliases.get(commandName));
    if (!command) return false;
    // TODO: remover quando converter o Command para typescript
    // @ts-ignore
    return FileUtil.reloadFile(command.dir, (cmd) => this.loadCommand(cmd, command.dir));
  }

  login(token?: string) {
    return super.login(token);
  }

  async postExistingCommand(command: Command['config']) {
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
      this.repositories.commandRepository.create(command.name, data);
    } else {
      this.repositories.commandRepository.updateByName(command.name, data);
    }
  }

  async loadCommand(NewCommand: typeof Command, filepath: string) {
    const command = new NewCommand(this);

    command.dir = filepath;

    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config.aliases.forEach((a) => this.aliases.set(a, command.config.name));

    const cmdInDb = await this.database.Cmds.findById(command.config.name);
    if (!cmdInDb) {
      this.database.Cmds.create({
        _id: command.config.name,
      });
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
    return FileUtil.readDirectory(directory, (Event, filepath) => {
      this.events.add(FileUtil.filename(filepath), filepath, new Event(this));
    });
  }
}
