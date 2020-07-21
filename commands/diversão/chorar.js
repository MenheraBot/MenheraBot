const Discord = require("discord.js");
module.exports = {
  name: "chorar",
  aliases: ["chora", "cry"],
  cooldown: 2,
  category: "diversão",
  description: "Mostre a todos que você está chorando, vai que assim tu ganha atenção",
  usage: "m!chorar [@menção]",
  run: async (client, message, args) => {
  
  let avatar = message.author.displayAvatarURL({ format: "png" });
  
  var list = [
    "https://i.imgur.com/5YWrh6Z.gif",
    "https://i.imgur.com/SzNkb87.gif",
    "https://i.imgur.com/7Yffi3x.gif",
    "https://i.imgur.com/evaPvIa.gif",
    "https://i.imgur.com/xsyIxxf.gif",
    "https://i.imgur.com/I18iVJC.gif",
    "https://i.imgur.com/fFKlGMv.gif",
    "https://i.imgur.com/XbxsKOw.gif",
    "https://i.imgur.com/iLTOyBa.gif",
    "https://i.imgur.com/mX1AWPv.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();
  
  if(user && user.bot)  return message.channel.send(`Nem vem que nenhum bot faz alguem chorar, eles são amigáveis e divertidos. Assim como eu`)

  if (!user) {
    const embed = new Discord.MessageEmbed()
    .setTitle("Sad :(")
    .setColor("#000000")
    .setDescription(`${message.author} está chorando`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setFooter("Oq será que aconteceu?")
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
    return;
  }

  if (user === message.author) {
    const embed = new Discord.MessageEmbed()
    .setTitle("Sad :( ")
    .setColor("#000000")
    .setDescription(`${message.author} está chorando`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setFooter("Oq será que aconteceu?")
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
    return;
  }

  

  const embed = new Discord.MessageEmbed()
    .setTitle("Sad :(")
    .setColor("#000000")
    .setDescription(`${user} fez ${message.author} chorar`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setFooter(`Poxa ${user.username}, pra que isso?`)
    .setAuthor(message.author.tag, avatar);

  await message.channel.send(embed);
}};
