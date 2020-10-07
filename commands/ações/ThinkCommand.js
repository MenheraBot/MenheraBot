const {MessageEmbed} = require("discord.js");

module.exports = {
  name: "pensar",
  aliases: ["pensando", "think", "thinking"],
  cooldown: 2,
  category: "ações",
  dir: 'ThinkCommand',
  description: "Gabriel o pensador apenas",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!pensar <@menção>",
  run: async (client, message, args) => {

  var list = [
    "https://i.imgur.com/ZIxBpIz.gif",
    "https://i.imgur.com/DcEnIqE.gif",
    "https://i.imgur.com/VxaZYdc.gif",
    "https://i.imgur.com/OTRhikB.gif",
    "https://i.imgur.com/TP20k2N.gif",
    "https://i.imgur.com/Rl4oqwb.gif",
    "https://i.imgur.com/gCoDPJi.gif",
    "https://i.imgur.com/bOKb4Hs.gif",
    "https://i.imgur.com/WiaE3Xl.gif",
    "https://i.imgur.com/obQ1JGB.gif",
    "https://i.imgur.com/IYkQWNK.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();
  let avatar = message.author.displayAvatarURL({ format: "png" });
  
  if(user && user.bot)  return message.channel.send(`Awnnn que coisa mais linda, ${message.author} está pensando num bot >.<`)

  if (!user) {
    const embed = new MessageEmbed()
    .setTitle("Pensar")
    .setColor("#000000")
    .setDescription(`${message.author} está PENSANDO`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
    return;
  }

  if (user === message.author) {
    const embed = new MessageEmbed()
    .setTitle("Pensar")
    .setColor("#000000")
    .setDescription(`${message.author} está em ANÁLISE`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
    return;
  }

  
  const embed = new MessageEmbed()
    .setTitle("pensar")
    .setColor("#000000")
    .setDescription(`${message.author} está pensando em ${user} hehehehe`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

  await message.channel.send(embed);

  }}
