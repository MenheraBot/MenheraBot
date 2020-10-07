const {MessageEmbed} = require("discord.js");
const database = require("../../models/user.js")
module.exports = {
  name: "avatar",
  aliases: [],
  cooldown: 5,
  category: "info",
  description: "Mostra o avatar de alguem",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!avatar [@menção]",
  run: async (client, message, args) => {
  
  let user = message.mentions.users.first() || client.users.cache.get(args[0]);

  if (!user) user = message.author;

  let cor;

  const db = await database.findOne({id: user.id})

  if(db && db.cor){
     cor = db.cor
    } else cor = "#a788ff";
  
  const img = user.displayAvatarURL({
    dynamic: true,
    size: 1024
  });

  let embed = new MessageEmbed()
    .setTitle(`Avatar de ${user.username}`)
    .setImage(img)
    .setColor(cor)
    .setFooter("Que imagem linda omodeuso");

    if(user.id === client.user.id){

    embed.setTitle(`Meu avatar (${user.username})`)
    embed.setColor('#f276f3')
    embed.setFooter("Eu sou muito linda né vei tem como não")
   
  }

  message.channel.send(message.author, embed);
}};
