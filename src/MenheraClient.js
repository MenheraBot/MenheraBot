/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { Client, Collection } = require('discord.js');
const Sentry = require('@sentry/node');
const i18next = require('i18next');

const EventManager = require('./structures/EventManager');
const Database = require('./database/MongoDatabase');
const Constants = require('./structures/MenheraConstants');
const RpgChecks = require('./structures/Rpgs/checks');
const LocaleStructure = require('./structures/LocaleStructure');
const ShardManager = require('./structures/ShardManager');
const FileUtil = require('./utils/FileUtil');
const Reminders = require('./utils/RemindersChecks');

module.exports = class MenheraClient extends Client {
  constructor(options = {}, config) {
    super(options);

    this.database = new Database(process.env.DATABASE_URI);
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
    if (this.config.sentry_dns) {
      Sentry.init({ dsn: this.config.sentry_dns });
    }

    const locales = new LocaleStructure();
    const reminder = new Reminders(this);

    reminder.loop();
    await locales.load();
    await this.database.createConnection();
    await this.loadCommands(this.config.commandsDirectory);
    await this.loadEvents(this.config.eventsDirectory);
    return true;
  }

  async reloadCommand(commandName) {
    const command = this.commands.get(commandName)
      || this.commands.get(this.aliases.get(commandName));
    if (!command) return false;

    return FileUtil.reloadFile(command.dir, (cmd) => this.loadCommand(cmd, command.dir));
  }

  login(token) {
    return super.login(token);
  }

  async postExistingCommand(command) {
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

  async loadCommand(NewCommand, filepath) {
    const command = new NewCommand(this);

    command.dir = filepath;

    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config.aliases.forEach((a) => this.aliases.set(a, command.config.name));

    const cmdInDb = await this.repositories.cmdRepository.findByName(command.config.name);
    if (!cmdInDb) {
      this.repositories.cmdRepository.create(command.config.name);
    }

    if (command.config.category !== 'Dev') {
      this.postExistingCommand(command.config);
    }
  }

  loadCommands(directory) {
    // @ts-ignore
    return FileUtil.readDirectory(directory, (...args) => this.loadCommand(...args));
  }

  loadEvents(directory) {
    // @ts-ignore
    return FileUtil.readDirectory(directory, (Event, filepath) => {
      this.events.add(FileUtil.filename(filepath), filepath, new Event(this));
    });
  }
};
