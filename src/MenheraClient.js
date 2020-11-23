/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { Client, Collection } = require('discord.js');
const Sentry = require('@sentry/node');
const EventManager = require('./structures/EventManager');
const Reminders = require('./utils/RemindersChecks');
const Database = require('./structures/DatabaseConnection');
const Config = require('../config.json');
const RpgChecks = require('./structures/Rpgs/checks');
const FileUtil = require('./utils/FileUtil');
const LocaleStructure = require('./structures/LocaleStructure');

module.exports = class WatchClient extends Client {
  constructor(options = {}) {
    super(options);

    this.database = Database;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new EventManager(this);
    this.config = Config;
    this.rpgChecks = RpgChecks;
  }

  init() {
    Sentry.init({ dsn: this.config.sentry_dns });
    const locales = new LocaleStructure();
    const reminder = new Reminders(this);
    reminder.loop();
    locales.load();
    return true;
  }

  reloadCommand(commandName) {
    const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
    if (!command) return false;
    const { dir } = command;
    this.commands.delete(command.config.name);
    delete require.cache[require.resolve(dir)];
    try {
      // eslint-disable-next-line global-require
      const Command = require(dir);
      const cmd = new Command(this);
      cmd.dir = dir;
      this.commands.set(cmd.config.name, cmd);
      return true;
    } catch (e) {
      return e;
    }
  }

  login(token) {
    return super.login(token);
  }

  async loadCommand(Command, filepath) {
    const command = new Command(this);
    command.dir = filepath;
    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config.aliases.forEach((a) => this.aliases.set(a, command.config.name));
    const cmdInDb = await this.database.Cmds.findById(command.config.name);
    if (cmdInDb) {
      command.maintenance = cmdInDb.maintenance;
      command.maintenanceReason = cmdInDb.maintenanceReason;
    } else {
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
