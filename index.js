const {Client, Collection} = require("discord.js");
const client = new Client({fetchAllMembers: true, disableMentions: "everyone"});
const config = require("./config.json");
const fs = require("fs-extra");
const mongoose = require("mongoose");
mongoose.connect(config.uri, {useNewUrlParser: true, useUnifiedTopology: true }).catch(error => console.error(error));

client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");


["command", "events"].forEach(handler => {
  require(`./handler/${handler}`)(client);
})


client.login(config.token);
