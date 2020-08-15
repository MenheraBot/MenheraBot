const Discord = require("discord.js");
module.exports = {
  name: "avatar",
  aliases: ["pfp"],
  cooldown: 5,
  category: "info",
  description: "Mostra o avatar de alguem",
  usage: "m!avatar [@menção]",
  run: async (client, message, args) => {
  
  let user = message.mentions.users.first() || client.users.cache.get(args[0]);

  if (!user) user = message.author;
  
  const img = user.displayAvatarURL({
    format: "png",
    dynamic: true,
    size: 1024
  });

  let embed = new Discord.MessageEmbed()
    .setTitle(`Avatar de ${user.username}`)
    .setImage(img)
    .setFooter("Que imagem linda omodeuso");

    if(user.id === client.user.id){

    embed.setTitle(`Meu avatar (${user.username})`)
    embed.setColor('#f276f3')
    embed.setFooter("Eu sou muito linda né vei tem como não")
   
  }
    message.reply(embed);
}};
