const serverDb = require("../../models/guild.js")

module.exports = {
  name: "prefix",
  aliases: ["setprefix"],
  cooldown: 10,
  category: "moderação",
  description: "Troque meu prefixo neste servidor",
  userPermission: ["MANAGE_GUILD"],
  clientPermission: null,
  usage: "m!prefix <prefixo>",
  run: async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("<:negacao:759603958317711371> | Você precisa da permissão de Gerenciar Servidor para utilizar este comando");
    
    if (!args[0]) return message.channel.send("<:negacao:759603958317711371> | Você não disse qual será o novo prefixo do servidor")
        if (args[0].length > 3) return message.channel.send("<:negacao:759603958317711371> | Este prefixo é muito longo! Escolha um prefixo com no máximo 3 caracteres")
        
        const server = await serverDb.findOne({id: message.guild.id})
		server.prefix = args[0]
		server.save()

		message.channel.send("<:positivo:759603958485614652> | Certo, meu prefixo neste servidor passa a ser " + server.prefix);

  }};
