const Discord = require("discord.js");
const Warn = require("../../models/warn.js");

module.exports = {
  name: "unwarn",
  aliases: ["desavisar", "delwarn"],
  cooldown: 2,
  category: "moderação",
  description: "Retire um aviso de um usuário",
  usage: "m!unwarn <usuário>",
  run: async (client, message, args) => {
      if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("Você precisa da permissão `KICK_MEMBERS` para usar esse comando")

      const user = message.mentions.users.first() || client.users.cache.get(args[0]);
      if(!user) return message.reply("Nenhum usuário foi mencionado");
      if(user.bot) return message.reply("Não tem como tirar avisos de algo que nunca terá avisos");
      if(user.id === message.author.id) return message.reply("PARA PARA PARA PARA PARA PARA PARA. Você não vai tirar seus próprios avisos. JOÃO KLEBER")
      if(!message.guild.members.cache.get(user.id)) return message.reply("Este membro não está neste servidor!!!")

      Warn.findOneAndDelete({userId: user.id, guildId: message.guild.id}).sort([['data', 'descending']]).exec((err, db) => {
        if(err) console.log(err);
        if(!db || db.length < 1) return message.channel.send(`${user} não possui avisos para deletar`);
        message.channel.send("Aviso removido com sucesso")
    })

}};
