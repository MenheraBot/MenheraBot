const Discord = require("discord.js");

module.exports = {
  name: "sono",
  aliases: ["dormir"],
  cooldown: 2,
  category: "diversão",
  description: "Mostre para os outros que você vai de base",
  usage: "m!sono",
  run: async (client, message, args) => {

  var list = [
    "https://i.imgur.com/143cxRi.gif",
    "https://i.imgur.com/P3SaVUx.gif",
    "https://i.imgur.com/NAMHpKN.gif",
    "https://i.imgur.com/lsBhvDD.gif",
    "https://i.imgur.com/N9iJWAE.gif",
    "https://i.imgur.com/kXke8fG.gif",
    "https://i.imgur.com/ijs0599.gif",
    "https://i.imgur.com/e49j7ZR.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let avatar = message.author.displayAvatarURL({ format: "png" });


    const embed = new Discord.MessageEmbed()
    .setTitle("Sono")
    .setColor("#000000")
    .setDescription(`${message.author} está com sonin UwU`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
  
  }}
