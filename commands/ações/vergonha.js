const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "vergonha",
  aliases: ["shy", "flushed"],
  cooldown: 2,
  category: "ações",
  description: "hihihi, oto com vergonha",
  usage: "m!vergonha [@menção]",
  run: async (client, message, args) => {
  
  let avatar = message.author.displayAvatarURL({ format: "png" });
  
  var list = [
  "https://i.imgur.com/EQMScvF.gif",
  "https://i.imgur.com/1OjGQsd.gif",
  "https://i.imgur.com/xP2wWns.gif",
  "https://i.imgur.com/zP30BiK.gif",
  "https://i.imgur.com/0O3wG8G.gif",
  "https://i.imgur.com/izDqss0.gif",
  "https://i.imgur.com/nEfgLq6.gif",
  "https://i.imgur.com/RuYtSVJ.gif",
  "https://i.imgur.com/bJBOt20.gif",
  "https://i.imgur.com/QHptcE6.gif",
  "https://i.imgur.com/OdUhbx0.gif",
  "https://i.imgur.com/JQYACo7.gif",
  "https://i.imgur.com/RJZVYPh.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if (!user) {
    const embed = new MessageEmbed()
    .setTitle("Vergonhinha 👉👈")
    .setColor("#000000")
    .setDescription(`${message.author} está com vergonha >.<`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
    return;
  }

  if (user === message.author) {
    const embed = new MessageEmbed()
    .setTitle("Vergonhinha 👉👈")
    .setColor("#000000")
    .setDescription(`${message.author} está envergonhado`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
    return;
  }

  
  const embed = new MessageEmbed()
    .setTitle("Vergonhinha 👉👈")
    .setColor("#000000")
    .setDescription(`${user} deixou ${message.author} com vergonha >.<`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

  await message.channel.send(embed);
}};
