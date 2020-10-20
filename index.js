console.log("=================================================================")
const {
  Client,
  Collection
} = require("discord.js");
const client = new Client({
  fetchAllMembers: true,
  disableMentions: "everyone"
});
const config = require("./config.json");
const Sentry = require("@sentry/node");
const fs = require("fs-extra");
const mongoose = require("mongoose");
mongoose.connect(config.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) return console.log(`(x) Error to connecting to database \n${err}`)
  console.log("[DATABASE] Conectado com sucesso à database")
})

client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");


["command", "events"].forEach(handler => {
  require(`./handler/${handler}`)(client);
})

Sentry.init({
  dsn: config.sentry_dns
});

/*   
  process.__defineGetter__('stdout', function() { return fs.createWriteStream('../logs/logs.log', {flags:'a'})})
  process.__defineGetter__('stderr', function() { return fs.createWriteStream('../logs/error.log', {flags:'a'}) })
*/

client.login(config.token).catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`))