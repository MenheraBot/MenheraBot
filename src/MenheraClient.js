/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { Client, Collection } = require('discord.js');
const Sentry = require('@sentry/node');
const i18next = require('i18next');
const EventManager = require('./structures/EventManager');
const Reminders = require('./utils/RemindersChecks');
const Database = require('./structures/DatabaseConnection');
const Config = require('../config.json');
const Constants = require('./structures/MenheraConstants');
const RpgChecks = require('./structures/Rpgs/checks');
const FileUtil = require('./utils/FileUtil');
const LocaleStructure = require('./structures/LocaleStructure');
const ShardManager = require('./structures/ShardManager');
const Repositories = require('./repositories/repositories');

module.exports = class MenheraClient extends Client {
  constructor(options = {}, botSettings) {
    super(options);

    this.database = Database;
    this.repositories = Repositories;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new EventManager(this);
    this.config = Config;
    this.constants = Constants;
    this.rpgChecks = RpgChecks;
    this.botSettings = botSettings;

    if (this.shard) {
      this.shardManager = new ShardManager(this);
    }
  }

  async init() {
    Sentry.init({ dsn: this.config.sentry_dns });
    const locales = new LocaleStructure();
    const reminder = new Reminders(this);
    reminder.loop();
    await locales.load();
    await this.loadCommands(this.botSettings.commandsDirectory);
    await this.loadEvents(this.botSettings.eventsDirectory);
    return true;
  }

  async reloadCommand(commandName) {
    const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
    if (!command) return false;
    return FileUtil.reloadFile(command.dir, (Command) => this.loadCommand(Command, command.dir));
  }

  login(token) {
    return super.login(token);
  }

  async postExistingCommand(command) {
    const tPt = i18next.getFixedT('pt-BR');
    const tUs = i18next.getFixedT('en-US');

    const findInDb = await this.database.Commands.findOne({ name: command.name });

    if (findInDb) {
      findInDb.category = command.category;
      findInDb.pt_description = tPt(`commands:${command.name}.description`);
      findInDb.pt_usage = tPt(`commands:${command.name}.usage`);
      findInDb.us_description = tUs(`commands:${command.name}.description`);
      findInDb.us_usage = tUs(`commands:${command.name}.usage`);
      findInDb.save();
    } else {
      this.database.Commands({
        name: command.name,
        category: command.category,
        pt_description: tPt(`commands:${command.name}.description`),
        pt_usage: tPt(`commands:${command.name}.usage`),
        us_description: tUs(`commands:${command.name}.description`),
        us_usage: tUs(`commands:${command.name}.usage`),
      }).save();
    }
  }

  async loadCommand(Command, filepath) {
    const command = new Command(this);
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

    if (command.category !== 'Dev') this.postExistingCommand(command.config);
  }

  loadCommands(directory) {
    return FileUtil.readDirectory(directory, (...args) => this.loadCommand(...args));
  }

  loadEvents(directory) {
    return FileUtil.readDirectory(directory, (Event, filepath) => {
      this.events.add(FileUtil.filename(filepath), filepath, new Event(this));
    });
  }
};
