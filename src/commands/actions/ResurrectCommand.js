const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ResurrectCommand extends Command {
    constructor(client) {
        super(client, {
            name: "resurrect",
            aliases: ["reviver", "ressuscitar"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        var list = [
            "https://i.imgur.com/krVf6J7.gif",
            "https://i.imgur.com/igSM6nd.gif",
            "https://i.imgur.com/h1a2nd8.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();
        let avatar = message.author.displayAvatarURL({ format: "png" });

        if (!user) return message.menheraReply("question", t("commands:ressurect.no-mention"))

        if (user === message.author) return message.menheraReply("question", t("commands:ressurect.no-mention"))

        if (user.bot) return message.menheraReply("success", t("commands:ressurect.bot"))

        const embed = new MessageEmbed()
            .setTitle(t("commands:ressurect.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}