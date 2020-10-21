const Client = require('./src/MenheraClient')
const config = require('./config.json')
const client = new Client({ disableMentions: "everyone", fetchAllMembers: true })

client.sentryInit()
client.loadCommands("./src/commands")
client.loadEvents("./src/events")

client.login(config.token).then(() => {
    console.log("[INDEX] bot is online")
}).catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`))