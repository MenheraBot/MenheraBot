const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class PokeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "cutucar",
            aliases: ["poke"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        var list = [
            "https://i.imgur.com/ZWfpRM4.gif",
            "https://i.imgur.com/wLEViR5.gif",
            "https://i.imgur.com/oS4Rsi3.gif",
            "https://i.imgur.com/PxpyxfK.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (!user) return message.menheraReply("error", t("commands:poke.no-mention"));

        if (user === message.author) return message.menheraReply("error", t("commands:poke.self-mention"))

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle(t("commands:poke.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:poke.embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}