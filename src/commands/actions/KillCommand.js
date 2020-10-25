const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class KillCommand extends Command {
    constructor(client) {
        super(client, {
            name: "matar",
            aliases: ["kill"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        var list = [
            "https://i.imgur.com/teca6na.gif",
            "https://i.imgur.com/XaqZPBf.gif",
            "https://i.imgur.com/Kj331EJ.gif",
            "https://i.imgur.com/kzW8Lpc.gif",
            "https://i.imgur.com/b9byUSu.gif",
            "https://i.imgur.com/gsFgkDh.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();
        let avatar = message.author.displayAvatarURL({ format: "png" });

        if (!user) {
            return message.menheraReply("error", t("commands:kill.no-mention"))
        }

        if (user === message.author) {
            return message.menheraReply("error", t("commands:kill.self-mention"))
        }

        if (user.bot) {
            //links de robos
            var ro = [
                "https://i.imgur.com/tv9wQai.gif",
                "https://i.imgur.com/X9uUyEB.gif",
                "https://i.imgur.com/rtsjxWQ.gif"
            ];

            var Rrand = ro[Math.floor(Math.random() * ro.length)];

            const Rembed = new MessageEmbed()
                .setTitle(t("commands:kill.bot.embed_title"))
                .setColor("#000000")
                .setDescription(`${t("commands:kill.bot.embed_description_start")} \n${message.author} ${t("commands:kill.bot.embed_description_end")} ${user}`)
                .setImage(Rrand)
                .setThumbnail(avatar)
                .setAuthor(message.author.tag, avatar);

            return message.channel.send(Rembed);
        }

        const embed = new MessageEmbed()
            .setTitle(t("commands:kill.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:kill.embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}