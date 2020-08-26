const { readdirSync } = require("fs-extra");
const Discord = require("discord.js")

module.exports = (client) => {
readdirSync("./commands/").forEach(dir => {
    const commands = readdirSync(`./commands/${dir}/`).filter(f => f.endsWith(".js"));

    for(let file of commands){
        let pull = require(`../commands/${dir}/${file}`);

        if(pull.name) {
            client.commands.set(pull.name, pull);
        }
        if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name)); 
    }
})

};