const usuario = require("../../models/user.js");

module.exports = {
    name: "carteira",
    aliases: ["money", "banco", "bank"],
    cooldown: 2,
    category: "economia",
    description: "Veja a carteira de alguém",
    usage: "m!carteira [@usuário]",
    run: async (client, message, args) => {

        let pessoa = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!pessoa) pessoa = message.author;
          
        let user = await usuario.findOne({id: pessoa.id});
        if(!user) return message.channel.send("❌ | Este usuário não está em minha database")

        message.channel.send(`**${pessoa.tag}** possui **${user.estrelinhas}**⭐ e **${user.rolls}** 🔑`)
 }}

