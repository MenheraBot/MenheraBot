const serverDb = require("../../models/guild.js")

module.exports = {
  name: "prefix",
  aliases: ["changeprefix"],
  cooldown: 2,
  category: "moderação",
  description: "Troque meu prefixo neste servidor",
  usage: "m!avisos <usuario>",
  run: async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.reply("Você precisa da permissão de Gerenciar Servidor para utilizar este comando");
    
		if (!args[0]) return message.reply("Qual é o prefixo que deseja colocar para este servidor?")
		if (args[0].length > 3) return message.reply("Este prefixo é muito longo! Escolha um prefixo com no máximo 3 caracteres")
		serverDb.prefix = args[0]
		serverDb.save()

		message.reply("✅ | Certo, meu prefixo neste servidor passa a ser " + serverDb.prefix);

  }};
