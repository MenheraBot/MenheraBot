const {MessageEmbed} = require("discord.js")
module.exports = {
    name: "test",
    aliases: [],
    cooldown: 2,
    category: "Dev",
    description: "Arquivo destinado para testes",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!test [comando]",
    devsOnly: true,
    
    run: async (client, message, args) => {
            const database = require("../../models/rpg")
            database.countDocuments({})

    }}

