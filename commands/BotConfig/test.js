const Discord = require("discord.js");

module.exports = {
    name: "test",
    aliases: ["teste"],
    cooldown: 2,
    category: "BotConfig",
    description: "Arquivo destinado para testes",
    usage: "m!test [comando]",
    run: async (client, message, args) => {
    
    // let member = await client.users.fetch(args[0].replace(/[<@!>]/g, ""))
    //return message.channel.send(`O membro é ${member}\nCujo id é ${member.id}`);
}}
