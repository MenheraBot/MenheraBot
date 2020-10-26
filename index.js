require('./src/structures/ProtoTypes').start()
const Client = require('./src/MenheraClient')
const ShardManager = require('./src/structures/ShardManager')
const config = require('./config.json')
const client = new Client({ disableMentions: "everyone", fetchAllMembers: false })


if (client.shard) client.shardManager = new ShardManager(client)

client.sentryInit()
client.loadLocales()
client.loadCommands("./src/commands")
client.loadEvents("./src/events")

client.login(config.testToken).catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`))