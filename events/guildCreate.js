const serverDb = require("../models/guild.js")

module.exports = (client, server) => {

  serverDb({
    id: server.id
  }).save()

  client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:apaixonada:727975782034440252> | Fui adicionada ao servidor **${server}**`);
}