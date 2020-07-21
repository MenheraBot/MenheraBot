const Discord = require("discord.js");
module.exports = {
  name: "sucumba",
  aliases: ["sucumbe", "sucumbir", "fuzer"],
  cooldown: 3,
  category: "diversão",
  description: "SUCUMBA MUCALOL",
  usage: "m!sucumba <@menção>",
  run: async (client, message, args) => {
  const user = message.mentions.users.first();
  if(!user) return message.reply("n/a");
  if(user.id == message.author.id) return message.reply("n/a");

  message.channel.send(`SUCUMBA ${user} VERME\n LIXO\n HORROROSO\n RUIM\n HORRÍVEL\n ESCÓRIA\n BOSTA\n LIXOSO\n PERITO EM ENTREGAR GAME\n COCOZENTO`);
}};
