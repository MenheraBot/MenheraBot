require('./src/structures/ProtoTypes').start()
const Client = require('./src/MenheraClient')
const ShardManager = require('./src/structures/ShardManager')
const config = require('./config.json')
const http = require("./src/utils/HTTPrequests")
const client = new Client({ disableMentions: "everyone" })

if (client.shard) client.shardManager = new ShardManager(client)

client.init()
client.loadLocales()
client.loadCommands("./src/commands")
client.loadEvents("./src/events")

client.login(config.testToken).then(() => {
    console.log("[INDEX] Logged in")
}).catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`))

//Process listeners

process.on('exit', shirley => {
    http.status("down")
})

process.on("SIGTERM", teresinha => {
    http.status("down")
})

process.on('SIGINT', isback => {
    http.status("down")
}) 