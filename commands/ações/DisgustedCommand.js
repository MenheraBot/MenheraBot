const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "nojo",
  aliases: ["disgusted"],
  cooldown: 2,
  category: "ações",
  description: "eca que nojo",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!nojo <@menção>",
  run: async (client, message, args) => {

    var list = [
      "https://i.imgur.com/6sAJms7.gif",
      "https://i.imgur.com/l5QgIAV.gif",
      "https://i.imgur.com/7AskNHD.gif",
      "https://i.imgur.com/LOSFoxm.gif",
      "https://i.imgur.com/xPIvx3i.gif",
      "https://i.imgur.com/JXNiWIL.gif"
    ];

    var rand = list[Math.floor(Math.random() * list.length)];
    let user = message.mentions.users.first();
    let avatar = message.author.displayAvatarURL({ format: "png" });

    if (user && user.bot) return message.channel.send(`iiii ala ${message.author} tem nojinho de bot ui ui ui`)

    if (!user) {
      const embed = new MessageEmbed()
        .setTitle("Nojo")
        .setColor("#000000")
        .setDescription(`${message.author} está com nojinho ble`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      message.channel.send(embed);
      return;
    }

    if (user === message.author) {
      const embed = new MessageEmbed()
        .setTitle("Nojo")
        .setColor("#000000")
        .setDescription(`${message.author} está com nojinho ble`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      message.channel.send(embed);
      return;
    }


    const embed = new MessageEmbed()
      .setTitle("Nojo")
      .setColor("#000000")
      .setDescription(`${message.author} está com nojo de ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    await message.channel.send(embed);

  }
}
