const Discord = require("discord.js");
module.exports = {
  name: "say",
  aliases: ["dizer", "falar"],
  cooldown: 2,
  category: "util",
  description: "Faça-me dizer algo",
  usage: "m!say <texto>",
  run: async (client, message, args) => {
  const sayMessage = args.join(" ");
  if(!sayMessage) return message.reply("Oq quer que eu fale?")
  message.delete().catch(O_o => {});
  if (message.member.hasPermission("MANAGE_MESSAGES")) {
   return message.channel.send(sayMessage);
  }
  return message.reply("FRACO... LHE FALTA PODER")

}};
