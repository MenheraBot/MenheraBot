const Discord = require("discord.js");
module.exports = {
  name: "act",
  aliases: ["atividade", "activity"],
  cooldown: 2,
  category: "Dev",
  description: "Altera a atividade do bot",
  usage: "m!act [atividade]",

  run: async (client, message, args) => {
  if (message.author == client.users.cache.get('435228312214962204')) {
    message.delete().catch(erro =>message.reply("Ocorreu um erro inesperado, perdão. \n Erro: " + erro));
    client.user.setActivity(args.join(" "), { type: "WATCHING" });
  } else return message.reply("Sem permissão");
}};
