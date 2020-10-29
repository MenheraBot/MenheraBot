const { Client, Collection } = require("discord.js")
const { readdir } = require("fs-extra")
const EventManager = require("./structures/EventManager")
const Reminders = require("./utils/RemindersChecks")
const Sentry = require("@sentry/node")

module.exports = class WatchClient extends Client {
    constructor(options = {}) {
        super(options)

        this.database = require("./structures/DatabaseConnection")
        this.commands = new Collection()
        this.aliases = new Collection()
        this.events = new EventManager(this)
        this.config = require("../config.json")
    }
    init(){
        Sentry.init({dsn: this.config.sentry_dns});
        const reminder = new Reminders(this)
        reminder.loop()
    }

    reloadCommand(commandName) {
        const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName))
		if (!command) return false
		const dir = command.dir
		this.commands.delete(command.config.name)
		delete require.cache[require.resolve(dir)]
		try {
			const Command = require(dir)
			const cmd = new Command(this)
			cmd.dir = dir
			this.commands.set(cmd.config.name, cmd)
			return true
		} catch (e) {
			return e
		}
    }

    reloadEvent(eventName) {
        const event = this.events.events.some(s => s.name == eventName)
		if (!event) return false

		const dir = `./events/${eventName}.js`
		const status = this.events.remove(eventName)
		if (!status) return status
		delete require.cache[require.resolve(dir)]
		try {
			const Event = require(dir)
			const event = new Event(this)
			this.events.add(eventName, event)
			return true
		} catch (e) {
			return e
		}
    }

    login(token) {
        return super.login(token)
    }

    loadCommands() {
        readdir(`${__dirname}/commands/`, (err, files) => {
            if (err) console.error(err)
            files.forEach(category => {
                readdir(`${__dirname}/commands/${category}`, (err, cmd) => {
                    cmd.forEach(async cmd => {
                        const command = new (require(`${__dirname}/commands/${category}/${cmd}`))(this)
                        command.dir = `${__dirname}/commands/${category}/${cmd}`
                        this.commands.set(command.config.name, command)
                        command.config.aliases.forEach(a => this.aliases.set(a, command.config.name))
                        let cmdInDb = await this.database.Cmds.findById(command.config.name);
                        if (!cmdInDb) {
                            cmdInDb = new this.database.Cmds({
                                _id: command.config.name
                        })
                         cmdInDb.save()
                        }
                    })
                })
            })
        })
        return this
    }
    
    loadEvents(path) {
        readdir(path, (err, files) => {
            if (err) console.error(err)

            files.forEach(em => {
                const event = new (require(`../${path}/${em}`))(this)
                this.events.add(em.split(".")[0], event)
            })
        })
        return this
    }
    
    loadLocales() {
		const Locales = require("./structures/LocaleStructure")
		const locales = new Locales(this)
		locales.load()
    }

    async reloadLocales(){
        const Locales = require("./structures/LocaleStructure")
		const locales = new Locales(this)
		locales.reload()
    }
}