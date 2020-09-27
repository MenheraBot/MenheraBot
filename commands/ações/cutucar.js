const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "cutucar",
  aliases: ["cutuque", "cutuca", "catuca", "poke"],
  cooldown: 2,
  category: "ações",
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
    return message.channel.send("❌ | Tu tem que mencionar quem tu quer cutucar neah");
  }

  if (user === message.author) {
    return message.channel.send("❌ | Cutucar a si mesmo não tem graça! Mencione quem tu quer cutucar");
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new MessageEmbed()
    .setTitle("Cutucar")
    .setColor("#000000")
    .setDescription(`${message.author} cutucou ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
