const serverDb = require("../../models/guild.js")

module.exports = {
  name: "prefix",
  aliases: ["changeprefix"],
  cooldown: 2,
  category: "moderação",
  description: "Troque meu prefixo neste servidor",
  usage: "m!prefix <prefixo>",
  run: async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("❌ | Você precisa da permissão de Gerenciar Servidor para utilizar este comando");
    
    if (!args[0]) return message.channel.send("❌ | Você não disse qual será o novo prefixo do servidor")
        if (args[0].length > 3) return message.channel.send("❌ | Este prefixo é muito longo! Escolha um prefixo com no máximo 3 caracteres")
        
        const server = await serverDb.findOne({id: message.guild.id})
		server.prefix = args[0]
		server.save()

		message.channel.send("✅ | Certo, meu prefixo neste servidor passa a ser " + server.prefix);

  }};
