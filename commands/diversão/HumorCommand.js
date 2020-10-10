const {
  MessageEmbed
} = require("discord.js");
module.exports = {
  name: "humor",
  aliases: ["piada", "piadas", "tumor"],
  cooldown: 2,
  category: "diversão",
  dir: 'HumorCommand',
  description: "Mande quando alguem fizer aquela piadoca do joca",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!humor",
  run: async (client, message, args) => {
    if (message.deletable) message.delete();

    var list = [
      "https://i.imgur.com/2sI0NNt.jpg",
      "https://i.imgur.com/tynr1at.jpg",
      "https://i.imgur.com/9XDF9fp.jpg",
      "https://i.imgur.com/WZFzbD6.jpg",
      "https://i.imgur.com/kNfVk6P.png",
      "https://i.imgur.com/lfF79Z3.png",
      "https://i.imgur.com/K8c5P6Y.png",
      "https://i.imgur.com/dddehsM.png"
    ];

    var rand = list[Math.floor(Math.random() * list.length)];

    const embed = new MessageEmbed()
      .setImage(rand)
      .setTitle(`${message.author.username} achou você engraçadão ein`);

    message.channel.send(embed);
  }
};