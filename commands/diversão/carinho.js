const Discord = require("discord.js");
module.exports = {
  name: "carinho",
  aliases: ["pat"],
  cooldown: 2,
  category: "diversão",
  description: "faz carinho em alguem",
  usage: "m!carinho <@menção>",
  run: async (client, message, args) => {
  var list = [
    "https://i.imgur.com/UWbKpx8.gif",
    "https://i.imgur.com/4ssddEQ.gif",
    "https://i.imgur.com/LUypjw3.gif",
    "https://i.imgur.com/2lacG7l.gif",
    "https://i.imgur.com/2k0MFIr.gif",
    "https://i.imgur.com/XjsEMiK.gif",
    "https://i.imgur.com/sLwoifL.gif",
    "https://i.imgur.com/TPqMPka.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();

  if (!user) {
    return message.reply("Tu tem que mencionar em quem tu quer fazer carinho");
  }

  if (user === message.author) {
    return message.reply(
      "Se tu quiser tu pode fazer carinho em si mesmo agora. Utilize meu comando somente para fazer carinho em outras pessoas"
    );
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new Discord.MessageEmbed()
    .setTitle("Carinho")
    .setColor("#000000")
    .setDescription(`${message.author} fez carinho em ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setFooter("Pat pat pat pat pat pat")
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
