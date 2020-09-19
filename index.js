const Discord = require("discord.js");
const client = new Discord.Client({fetchAllMembers: true, disableMentions: "everyone"});
const config = require("./config.json");
const fs = require("fs-extra");
const DBL = require("dblapi.js");
const dbl = new DBL(config.dbt, client);
const mongoose = require("mongoose");
mongoose.connect(config.uri, {useNewUrlParser: true, useUnifiedTopology: true }).catch(error => console.error(error));

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.categories = fs.readdirSync("./commands/");


["command", "events"].forEach(handler => {
  require(`./handler/${handler}`)(client);
})


client.login(config.testToken);
