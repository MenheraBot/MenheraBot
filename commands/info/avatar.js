const Discord = require("discord.js");
module.exports = {
  name: "avatar",
  aliases: ["pfp"],
  cooldown: 5,
  category: "info",
  description: "Mostra o avatar de alguem",
  usage: "m!avatar [@menção]",
  run: async (client, message, args) => {
  
  let user = message.mentions.users.first();

  if (!user) user = message.author;
  
  const img = user.displayAvatarURL({
    format: "png",
    dynamic: true,
    size: 1024
  });

  const embed = new Discord.MessageEmbed()
    .setTitle(`Avatar de ${user.username}`)
    .setImage(img)
    .setFooter("Que imagem linda omodeuso");

  message.reply(embed);
}};
