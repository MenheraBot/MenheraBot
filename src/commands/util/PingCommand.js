const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            cooldown: 5,
            category: "util",
            clientPermissions: ["EMBED_LINKS"],
        })
    }
    async run({ message, args, server }, t) {

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle("🏓 | Pong!")
            .setDescription(`📡 | ${t("commands:ping.api")} **${Date.now() - message.createdTimestamp}ms**\n📡 | ${t("commands:ping.latency")} **${Math.round(this.client.ws.ping)}ms**`)
            .setFooter(message.author.tag, avatar)
            .setTimestamp()
            .setColor('#eab3fa')

        message.channel.send(embed)
    }
}