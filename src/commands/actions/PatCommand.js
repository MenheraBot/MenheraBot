const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class PatCommand extends Command {
    constructor(client) {
        super(client, {
            name: "carinho",
            aliases: ["pat", "cuddle"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        var list = [
            "https://i.imgur.com/UWbKpx8.gif",
            "https://i.imgur.com/4ssddEQ.gif",
            "https://i.imgur.com/LUypjw3.gif",
            "https://i.imgur.com/2lacG7l.gif",
            "https://i.imgur.com/2k0MFIr.gif",
            "https://i.imgur.com/XjsEMiK.gif",
            "https://i.imgur.com/sLwoifL.gif",
            "https://i.imgur.com/TPqMPka.gif",
            "https://i.imgur.com/9CvzZTE.gif",
            "https://i.imgur.com/RsPHpae.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (!user) return message.menheraReply("error", t("commands:pat.no-mention"))

        if (user === message.author) return message.menheraReply("error", t("commands:pat.self-mention"));

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle(t("commands:pat.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:pat.embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}