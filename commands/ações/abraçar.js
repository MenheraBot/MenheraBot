const {MessageEmbed} = require("discord.js");

module.exports = {
  name: "abraçar",
  aliases: ["abracar", "abraço", "abraco", "hug"],
  cooldown: 2,
  category: "ações",
  description: "Abraça alguem",
  usage: "m!abraçar <@menção>",
  run: async (client, message, args) => {

  var list = [
    "https://i.imgur.com/r9aU2xv.gif",
    "https://i.imgur.com/wOmoeF8.gif",
    "https://i.imgur.com/BPLqSJC.gif",
    "https://i.imgur.com/ntqYLGl.gif",
    "https://i.imgur.com/4oLIrwj.gif",
    "https://i.imgur.com/6qYOUQF.gif",
    "https://i.imgur.com/nrdYNtL.gif",
    "https://i.imgur.com/6xsp74b.gif",
    "https://i.imgur.com/77nkAiZ.gif",
    "https://i.imgur.com/LOg4Mpr.gif",
    "https://i.imgur.com/gI5qiWQ.gif",
    "https://i.imgur.com/i5vwbos.gif",
    "https://i.imgur.com/14FwOef.gif",
    "https://i.imgur.com/RPYNm9o.gif",
    "https://i.imgur.com/kSWpxnG.gif",
    "https://i.imgur.com/itRyalr.gif"
    
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();
  
  if(user && user.bot)  return message.channel.send(`${message.author} foi abraçar um robô, mas acabou tocando onde não devia, e tomou uma descarga elétrica de 220V e 10mA, sorte que a corrente usada no bot é baixa...`)

  if (!user) {
    return message.channel.send("<:negacao:759603958317711371> | você deve mencionar quem quer abraçar");
  }

  if (user === message.author) {
    return message.channel.send(`<:negacao:759603958317711371>| ${message.author}, tu não é a mulher elástico pra se abraçar, por favor, mencione quem você quer abraçar`);
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new MessageEmbed()
    .setTitle("Abraçar")
    .setColor("#000000")
    .setDescription(`${message.author} acaba de abraçar ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
  }}
