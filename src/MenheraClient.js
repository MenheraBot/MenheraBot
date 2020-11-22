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
    const reminder = new Reminders(this);
    reminder.loop();
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

  reloadEvent(eventName) {
    const event = this.events.events.some((s) => s.name === eventName);
    if (!event) return false;

    const dir = `./events/${eventName}.js`;
    const status = this.events.remove(eventName);
    if (!status) return status;
    delete require.cache[require.resolve(dir)];
    try {
      // eslint-disable-next-line global-require
      const Event = require(dir);
      const eventClasse = new Event(this);
      this.events.add(eventName, eventClasse);
      return true;
    } catch (e) {
      return e;
    }
  }

  login(token) {
    return super.login(token);
  }

  loadCommands(directory) {
    return FileUtil.readDirectory(directory, async (Command, filepath) => {
      const command = new Command(this);
      command.dir = filepath;
      this.commands.set(command.config.name, command);
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
    });
  }

  loadEvents(directory) {
    return FileUtil.readDirectory(directory, (Event, filepath) => {
      console.log(FileUtil.filename(filepath));
      this.events.add(FileUtil.filename(filepath), new Event(this));
    });
  }

  loadLocales() {
    const Locales = require('./structures/LocaleStructure');
    const locales = new Locales(this);
    locales.load();
    return true;
  }

  async reloadLocales() {
    const Locales = require('./structures/LocaleStructure');
    const locales = new Locales(this);
    locales.reload();
    return true;
  }
};
