const Discord = require("discord.js");

module.exports = {
    name: "find",
    aliases: ["achar"],
    cooldown: 2,
    category: "Dev",
    description: "Arquivo destinado para testes",
    usage: "m!test [comando]",
    run: async (client, message, args) => {
        if(message.author.id !== '435228312214962204') return message.channel.send("Este comando é único de minha dona!")
    }}