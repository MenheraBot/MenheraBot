const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ShyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "vergonha",
      aliases: ["shy"],
      clientPermissions: ["EMBED_LINKS"],
      category: "ações"
    })
  }
  async run({ message, args, server }, t) {

    let avatar = message.author.displayAvatarURL({ format: "png" });

    var list = [
      "https://i.imgur.com/EQMScvF.gif",
      "https://i.imgur.com/1OjGQsd.gif",
      "https://i.imgur.com/xP2wWns.gif",
      "https://i.imgur.com/zP30BiK.gif",
      "https://i.imgur.com/0O3wG8G.gif",
      "https://i.imgur.com/izDqss0.gif",
      "https://i.imgur.com/nEfgLq6.gif",
      "https://i.imgur.com/RuYtSVJ.gif",
      "https://i.imgur.com/bJBOt20.gif",
      "https://i.imgur.com/QHptcE6.gif",
      "https://i.imgur.com/OdUhbx0.gif",
      "https://i.imgur.com/JQYACo7.gif",
      "https://i.imgur.com/RJZVYPh.gif"
    ];

    var rand = list[Math.floor(Math.random() * list.length)];
    let user = message.mentions.users.first();

    if (!user || user == message.author) {
      const embed = new MessageEmbed()
        .setTitle(t("commands:shy.no-mention.embed_title"))
        .setColor("#000000")
        .setDescription(`${message.author} ${t("commands:shy.no-mention.embed_description")}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(t("commands:shy.embed_title"))
      .setColor("#000000")
      .setDescription(`${user} ${t("commands:shy.embed_description_start")} ${message.author} ${t("commands:shy.embed_description_end")}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
}