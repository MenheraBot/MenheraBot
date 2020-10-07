const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "fodase",
  aliases: ["foda-se", "fodase?", "foda-se?", "fds"],
  cooldown: 2,
  category: "diversão",
  description: "Alguem mandou algo que ninguem perguntou? Taque o fodase",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!fodase",
  run: async (client, message, args) => {
  if (message.deletable) message.delete();

  var list = [
    "https://i.imgur.com/ucvHQai.png",
    "https://i.imgur.com/j9IXfh0.png",
    "https://i.imgur.com/CZoNkKX.png",
    "https://i.imgur.com/Ac8874x.png",
    "https://i.imgur.com/kQC4Oct.png",
    "https://i.imgur.com/Fye31Ie.png",
    "https://i.imgur.com/r72CED0.png",
    "https://i.imgur.com/YG43ClB.png",
    "https://i.imgur.com/yt48NPX.png",
    "https://i.imgur.com/gb1ZE3y.png",
    "https://i.imgur.com/URtN9Ef.png",
    "https://i.imgur.com/PAgfWLm.png",
    "https://i.imgur.com/c8zniBI.png",
    "https://i.imgur.com/MV8Jffm.png",
    "https://i.imgur.com/rV4MwbF.png",
    "https://i.imgur.com/2gw3Tgq.png",
    "https://i.imgur.com/HVpET4Q.png",
    "https://i.imgur.com/X4nSh6Q.png",
    "https://i.imgur.com/JONYnry.png",
    "https://i.imgur.com/meA60TN.png",
    "https://i.imgur.com/AIn4jRx.png",
    "https://i.imgur.com/H4ViW8F.png"
  ];

  var frases = [
    `${message.author.username} disse que fodase`,
    "Inteligente, pena que fodase",
    "Ta, e o fodase?"
  ];

  var frasesUsada = frases[Math.floor(Math.random() * frases.length)];
  var rand = list[Math.floor(Math.random() * list.length)];

  const embed = new MessageEmbed()
    .setImage(rand)
    .setFooter(`Autor: ${message.author.username}`)
    .setTitle(frasesUsada);

  message.channel.send(embed);
}};
