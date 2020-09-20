const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "bater",
  aliases: ["bate", "slap", "tapa", "tapear"],
  cooldown: 2,
  category: "ações",
  description: "Bate em alguém",
  usage: "m!bater <@menção>",
  run: async (client, message, args) => {
  var list = [
    "https://i.imgur.com/XqtlhuZ.gif",
    "https://i.imgur.com/HcTCdJ1.gif",
    "https://i.imgur.com/mdZR2D2.gif",
    "https://i.imgur.com/Li9mx3A.gif",
    "https://i.imgur.com/kVI9SHf.gif",
    "https://i.imgur.com/fm49srQ.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if(user && user.bot)  return message.channel.send("DIGA NÃO À AGRESSÃO À ROBÔS");
  
  if (!user) {
    return message.reply("Tu tem que mencionar em quem tu quer bater");
  }

  if (user === message.author) {
    return message.reply(
      "Eu não vou fazer tu se bater, mencione outra pessoa"
    );
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new MessageEmbed()
    .setTitle("TAPÃO")
    .setColor("#000000")
    .setDescription(`${message.author} meteu o tapão em ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
