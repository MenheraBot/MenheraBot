const Discord = require("discord.js");
module.exports = {
  name: "rir",
  aliases: ["ri", "sirrir", "lol", "laugh"],
  cooldown: 2,
  category: "diversão",
  description: "Mostre a todos que estás rindo ",
  usage: "m!rir [@menção]",
  run: async (client, message, args) => {
  
  let avatar = message.author.displayAvatarURL({ format: "png" });
  
  var list = [
   "https://i.imgur.com/Greznmg.gif",
   "https://i.imgur.com/mmFOYF1.gif",
   "https://i.imgur.com/sYILQYt.gif",
   "https://i.imgur.com/5VvTimD.gif",
   "https://i.imgur.com/QNE6CFW.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if (!user) {
    const embed = new Discord.MessageEmbed()
    .setTitle("KKKK RINDO")
    .setColor("#000000")
    .setDescription(`${message.author} está se mijando de rir`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setFooter("AAAAAHAHAAA PARABÉNS ZÉ")
    .setAuthor(message.author.tag, avatar);
                
    return message.channel.send(embed);
  }

  let username = user.username.toUpperCase()

  const embed = new Discord.MessageEmbed()
    .setTitle("RINDO")
    .setColor("#000000")
    .setDescription(`${user} fez ${message.author} cair no chão de tanto rir`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setFooter(`AH ${username} MUITO BOM VEI KKKKKK`)
    .setAuthor(message.author.tag, avatar);

  await message.channel.send(embed);
}};
