const {MessageEmbed} = require("discord.js");

module.exports = {
  name: "atirar",
  aliases: ["tiro", "shot"],
  cooldown: 2,
  category: "ações",
  dir: 'ShotCommand',
  description: "Atira em alguem",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!atirar <@menção>",
  run: async (client, message, args) => {
  var list = [
    "https://i.imgur.com/4d1oxl9.gif",
    "https://i.imgur.com/vJdv4PP.gif",
    "https://i.imgur.com/nKHZmiY.gif",
    "https://i.imgur.com/G5kWKws.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if (!user) {
    return message.channel.send("<:negacao:759603958317711371> | Tu tem que mencionar em quem tu quer atirar");
  }

  if (user === message.author) {
    return message.channel.send("<:negacao:759603958317711371> | suicídio não!!!");
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new MessageEmbed()
    .setTitle("Atirar")
    .setColor("#000000")
    .setDescription(`${message.author} meteu bala em ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
