const Discord = require("discord.js");


const Warns = require("../../models/warn.js")

module.exports = {
    name: "test",
    aliases: ["teste"],
    cooldown: 2,
    category: "Dev",
    description: "Arquivo destinado para testes",
    usage: "m!test [comando]",
    run: async (client, message, args) => {
        if(message.author.id !== '435228312214962204') return message.channel.send("Este comando é exclusivo da minha Dona")
    // let member = await client.users.fetch(args[0].replace(/[<@!>]/g, ""))
    //return message.channel.send(`O membro é ${member}\nCujo id é ${member.id}`);
    }}