const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "medo",
  aliases: ["afraid", "assustado", "aterrorizado"],
  cooldown: 2,
  category: "ações",
  description: "MEDO?????",
  usage: "m!medo [@menção]",
  run: async (client, message, args) => {
  
  let avatar = message.author.displayAvatarURL({ format: "png" });
  
  var list = [
   "https://i.imgur.com/NXZVVCt.gif",
   "https://i.imgur.com/G3RfNUM.gif",
   "https://i.imgur.com/tHm4Lcz.gif",
   "https://i.imgur.com/1HRTQe9.gif",
    "https://i.imgur.com/t2cTiQv.gif",
    "https://i.imgur.com/QscQ25U.gif",
    "https://i.imgur.com/MtzUkqy.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if (!user) {
    const embed = new MessageEmbed()
    .setTitle("MEDO")
    .setColor("#000000")
    .setDescription(`${message.author} está com medo`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);
                
    return message.channel.send(embed);
  }

  let username = user.username.toUpperCase()

  const embed = new MessageEmbed()
    .setTitle("MEDO")
    .setColor("#000000")
    .setDescription(`${message.author} esta com medo de ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

  await message.channel.send(embed);
}};
