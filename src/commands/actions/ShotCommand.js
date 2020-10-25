const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ShotCommand extends Command {
    constructor(client) {
        super(client, {
            name: "atirar",
            aliases: ["shot"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        var list = [
            "https://i.imgur.com/4d1oxl9.gif",
            "https://i.imgur.com/vJdv4PP.gif",
            "https://i.imgur.com/nKHZmiY.gif",
            "https://i.imgur.com/G5kWKws.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (!user) return message.menheraReply("error", t("commands:shot.no-mention"))

        if (user === message.author) return message.menheraReply("error", t("commands:shot.self-mention"))

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle(t("commands:shot.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:shot.embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}