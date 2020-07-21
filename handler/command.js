const { readdirSync } = require("fs-extra");
const ascii = require("ascii-table");
const Discord = require("discord.js")

const table = new ascii().setHeading("Comando", "Load Status");

module.exports = (client) => {
readdirSync("./commands/").forEach(dir => {
    const commands = readdirSync(`./commands/${dir}/`).filter(f => f.endsWith(".js"));

    for(let file of commands){
        let pull = require(`../commands/${dir}/${file}`);

        if(pull.name) {
            client.commands.set(pull.name, pull);  
            table.addRow(file, '✅'); 
        } else {
            table.addRow(file, '❌');
            continue;
        }
        if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name)); 
       /*  if(pull.cooldown){
            client.cooldowns.set(pull.name, new Discord.Collection())
        }   */ 
    }
})

console.log(table.toString());

};