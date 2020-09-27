const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "beijar",
  aliases: ["beijo", "kiss"],
  cooldown: 2,
  category: "ações",
  description: "Beija alguem",
  usage: "m!beijar <@menção>",
  run: async (client, message, args) => {
  var list = [
    "https://i.imgur.com/sGVgr74.gif",
    "https://i.imgur.com/lmY5soG.gif",
    "https://i.imgur.com/e0ep0v3.gif",
    "https://i.imgur.com/P4QizDI.png",
    "https://i.imgur.com/GvS0PdU.gif",
    "https://i.imgur.com/IWBnu8V.gif",
    "https://i.imgur.com/8YkQ4py.gif",
    "https://i.imgur.com/g5la1Y0.gif",
    "https://i.imgur.com/ZD64Ly8.gif",
    'https://i.imgur.com/JOtxMGW.gif',
    "https://i.imgur.com/qlPCzMA.gif",
    "https://i.imgur.com/YbNv10F.gif",
    "https://i.imgur.com/IgGumrf.gif",
    "https://i.imgur.com/KKAMPju.gif",
    "https://i.imgur.com/eisk88U.gif",
    "https://i.imgur.com/9y34cfo.gif",
    "https://i.imgur.com/9758cJX.gif",
    "https://i.imgur.com/SS7sQpj.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();
  
  if(user && user.bot)  return message.channel.send(`${message.author} beijou um robô, e acabou tocando em um fio descascado. Sorte que ele estava com chinelo nos pés. A ligação com a Terra foi cortado, nenhum circuito se fechou. Dessa vez foi safe.`);

  if (!user) {
    return message.channel.send("❌ | Tu tem que mencionar quem tu quer beijar neah");
  }

  if (user === message.author) {
    return message.channel.send("❌ | Eu sei que amor próprio é tudo, mas por favor, beije alguém que não seja si mesmo");
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new MessageEmbed()
    .setTitle("Beijar")
    .setColor("#000000")
    .setDescription(`${message.author} acabou de beijar ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
