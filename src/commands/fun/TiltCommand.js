const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class HumorCommand extends Command {
    constructor(client) {
        super(client, {
            name: "tilt",
            aliases: ["tiltado", "tiltas"],
            category: "diversão",
            clientPermissions: ["MANAGE_MESSAGES", "EMBED_LINKS"]
        })
    }
    async run({ message, args, server }, t) {

        if (message.deletable) message.delete();

        const mention = message.mentions.users.first();

        var list = [
            'https://i.imgur.com/HNZeSQt.png'
        ];

        var rand = list[Math.floor(Math.random() * list.length)];

        let embed = new MessageEmbed()
            .setImage(rand)
            .setFooter(`${t("commands:tilt.footer")} ${message.author.username}`)

        if (!mention) {
            embed.setDescription(t("commands:tilt.phrase"));
        } else {
            embed.setDescription(`${t("commands:tilt.phrase-mention")} ${mention}`);
        }

        message.channel.send(embed);
    }
}