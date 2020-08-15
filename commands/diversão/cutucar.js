const Discord = require("discord.js");
module.exports = {
  name: "cutucar",
  aliases: ["cutuque", "cutuca", "catuca", "poke"],
  cooldown: 2,
  category: "diversão",
  description: "Cutuque alguem",
  usage: "m!cutucar <@menção>",
  run: async (client, message, args) => {
  var list = [
   "https://i.imgur.com/ZWfpRM4.gif",
    "https://i.imgur.com/wLEViR5.gif",
    "https://i.imgur.com/oS4Rsi3.gif",
    "https://i.imgur.com/PxpyxfK.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if (!user) {
    return message.reply("Tu tem que mencionar quem tu quer cutucar neah");
  }

  if (user === message.author) {
    return message.reply(
      "Cutucar a si mesmo não tem graça! Mencione quem tu quer cutucar"
    );
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new Discord.MessageEmbed()
    .setTitle("Cutucar")
    .setColor("#000000")
    .setDescription(`${message.author} cutucou ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
