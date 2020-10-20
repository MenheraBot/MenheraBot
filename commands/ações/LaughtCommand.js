const {
  MessageEmbed
} = require("discord.js");
module.exports = {
  name: "rir",
  aliases: ["ri", "sirrir", "lol", "laugh"],
  cooldown: 2,
  category: "ações",
  dir: 'LaughtCommand',
  description: "Mostre a todos que estás rindo",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!rir [@menção]",
  run: async (client, message, args) => {

    let avatar = message.author.displayAvatarURL({
      format: "png"
    });

    var list = [
      "https://i.imgur.com/Greznmg.gif",
      "https://i.imgur.com/mmFOYF1.gif",
      "https://i.imgur.com/sYILQYt.gif",
      "https://i.imgur.com/5VvTimD.gif",
      "https://i.imgur.com/QNE6CFW.gif",
      "https://i.imgur.com/jdeN8mN.gif"
    ];

    var rand = list[Math.floor(Math.random() * list.length)];
    let user = message.mentions.users.first();

    if (!user) {
      const embed = new MessageEmbed()
        .setTitle("KKKK RINDO")
        .setColor("#000000")
        .setDescription(`${message.author} está se mijando de rir`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle("RINDO")
      .setColor("#000000")
      .setDescription(`${user} fez ${message.author} cair no chão de tanto rir`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    await message.channel.send(embed);
  }
};