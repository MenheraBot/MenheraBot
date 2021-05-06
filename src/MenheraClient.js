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
const http = require('./utils/HTTPrequests');
const RpgChecks = require('./structures/Rpgs/checks');
const FileUtil = require('./utils/FileUtil');
const LocaleStructure = require('./structures/LocaleStructure');

module.exports = class MenheraClient extends Client {
  constructor(options = {}) {
    super(options);

    this.database = Database;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new EventManager(this);
    this.config = Config;
    this.constants = Constants;
    this.rpgChecks = RpgChecks;
  }

  async init() {
    Sentry.init({ dsn: this.config.sentry_dns });
    const locales = new LocaleStructure();
    const reminder = new Reminders(this);
    reminder.loop();
    await http.clearExistingCommands();
    await locales.load();
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

  static async postExistingCommand(command) {
    const t = i18next.getFixedT('pt-BR');
    const CommandData = {
      name: command.config.name,
      description: t(`commands:${command.config.name}.description`),
      category: command.config.category,
    };
    if (command.category !== 'Dev') await http.postExistingCommands(CommandData);
  }

  async loadCommand(Command, filepath) {
    const command = new Command(this);
    command.dir = filepath;
    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config.aliases.forEach((a) => this.aliases.set(a, command.config.name));
    MenheraClient.postExistingCommand(command);
    const cmdInDb = await this.database.Cmds.findById(command.config.name);
    if (!cmdInDb) {
      this.database.Cmds.create({
        _id: command.config.name,
      });
    }
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
