const serverDb = require("../models/guild.js")

module.exports = (client, server) => {

    serverDb.findOneAndDelete({id: server.id}).then(res => console.log(`GuildDB deleted! ID: ${res.id}`));
    client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${server}**`)
}
