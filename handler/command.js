const {
    readdirSync
} = require("fs-extra");

const cmdDb = require("../models/cmds.js")

module.exports = (client) => {
    readdirSync("./commands/").forEach(async dir => {
        const commands = readdirSync(`./commands/${dir}/`).filter(f => f.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`../commands/${dir}/${file}`);

            client.commands.set(pull.name, pull);
            let cmdInDb = await cmdDb.findById(pull.name);
            if (!cmdInDb) {
                cmdInDb = new cmdDb({
                    _id: pull.name
                })
                cmdInDb.save()
            }

            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    })
};