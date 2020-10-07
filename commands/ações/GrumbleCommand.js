const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "resmungar",
  aliases: ["grumble", "grumbling", "resmungo", "humpf"],
  cooldown: 2,
  dir: 'GrumbleCommand',
  category: "ações",
  description: "Resmungue humpf",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!resmungar",
  run: async (client, message, args) => {
  
  let avatar = message.author.displayAvatarURL({ format: "png" });
  
  var list = [
    "https://i.imgur.com/l1jwHGy.gif",
    "https://i.imgur.com/4co1K8h.gif",
    "https://i.imgur.com/XAcuQN9.gif",
    "https://i.imgur.com/JeolGmS.gif",
    "https://i.imgur.com/lGUJNbY.gif",
    "https://i.imgur.com/V9XR3VN.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  
    const embed = new MessageEmbed()
    .setTitle("Humpf")
    .setColor("#000000")
    .setDescription(`${message.author} está resmungando`)
    .setThumbnail(avatar)
    .setImage(rand)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);
   
}};
