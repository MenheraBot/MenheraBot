const usuario = require("../../models/user.js");

module.exports = {
    name: "give",
    aliases: ["dar", "pay", "pagar"],
    cooldown: 2,
    category: "economia",
    description: "Dê estrelinhas para alguém",
    usage: "m!give <menção> <valor>",
    run: async (client, message, args) => {
        const mencionado = message.mentions.users.first()
        const valor = parseInt(args[1]);
        if(!mencionado) return message.channel.send("❌ | Você deve usar give @usuario `valor`")
        
        let user = await usuario.findOne({id: message.author.id})
        let user2 = await usuario.findOne({id: mencionado.id})

        if(!user2) return message.channel.send("❌ | Este usuário não está em minha database")
        if(!valor) return message.channel.send("❌ | Você deve usar give @usuario `valor`")

        if(valor < 1) return message.channel.send("❌ | O valor a ser dado deve ser maior que 0")
        if(valor > user.estrelinhas) return message.channel.send("❌ | Você não tem este tanto de estrelinhas")

        user.estrelinhas = user.estrelinhas - valor;
        user2.estrelinhas = user2.estrelinhas + valor
        user.save()
        user2.save()

        message.channel.send(`✅ | ${message.author} transferiu **${valor}** ⭐ para ${mencionado}`)
 }}

