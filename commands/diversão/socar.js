const Discord = require("discord.js");
module.exports = {
  name: "socar",
  aliases: ["tapa", "soca", "tapear", "slap"],
  cooldown: 2,
  category: "diversão",
  description: "Da aquele tapa de qualidade do VEM PRO FUT em alguem",
  usage: "m!socar <@menção>",
  run: async (client, message, args) => {
  var list = [
    "https://i.imgur.com/f2kkp3L.gif",
    "https://i.imgur.com/C6lqbl8.gif",
    "https://i.imgur.com/pX1E9uU.gif",
    "https://i.imgur.com/GfyKm1x.gif"
  ]; 

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();
  
  if(user && user.bot)  return message.channel.send(`DIGA NÃO À AGRESSÃO À ROBÔS`)

  if (!user) {
    return message.reply("Tu tem que mencionar em quem tu quer lançar aquele socão nas fuça");
  }

  if (user === message.author) {
    return message.reply(
      "Eu não vou fazer tu se bater, mencione outra pessoa"
    );
  }

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const embed = new Discord.MessageEmbed()
    .setTitle("Toma soco leve 🤜")
    .setColor("#000000")
    .setDescription(`${message.author} socou ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setFooter("AND HIS NAME IS JHON CENA. BOOM. PAPARAPAAAAAA")
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
}};
