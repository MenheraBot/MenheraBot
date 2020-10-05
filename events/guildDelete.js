const serverDb = require("../models/guild.js")

module.exports = (client, server) => {

    serverDb.findOneAndDelete({id: server.id }, function (err, docs) { 
        if (err){ 
            console.log(err) 
        } 
        else{ 
            console.log("[EVENT] Deleted Guild: " + docs.id); 
        } 
    }); 
    client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${server}**`)
}
