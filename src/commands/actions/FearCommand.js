const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class FearCommand extends Command {
    constructor(client) {
        super(client, {
            name: "medo",
            aliases: ["fear"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        let avatar = message.author.displayAvatarURL({ format: "png" });

        var list = [
            "https://i.imgur.com/NXZVVCt.gif",
            "https://i.imgur.com/G3RfNUM.gif",
            "https://i.imgur.com/tHm4Lcz.gif",
            "https://i.imgur.com/1HRTQe9.gif",
            "https://i.imgur.com/t2cTiQv.gif",
            "https://i.imgur.com/QscQ25U.gif",
            "https://i.imgur.com/MtzUkqy.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (!user) {
            const embed = new MessageEmbed()
                .setTitle(t("commands:fear.no-mention.embed_title"))
                .setColor("#000000")
                .setDescription(`${message.author} ${t("commands:fear.no-mention.embed_description")}`)
                .setThumbnail(avatar)
                .setImage(rand)
                .setAuthor(message.author.tag, avatar);

            return message.channel.send(embed);
        }

        const embed = new MessageEmbed()
            .setTitle(t("commands:fear.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:fear.embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        await message.channel.send(embed);
    }
}