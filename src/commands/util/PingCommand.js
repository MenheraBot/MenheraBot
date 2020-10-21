const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            cooldown: 5,
            description: "Mostra o ping do bot e de sua API",
            category: "util",
            clientPermissions: ["EMBED_LINKS"],
        })
    }
    async run(message, args) {

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle("🏓 | Pong!")
            .addField('📡 | Latência:', `**${Math.round(this.client.ws.ping)}ms**`)
            .addField('📡 | Latência da API:', `**${Date.now() - message.createdTimestamp}ms**`)
            .setFooter(message.author.tag, avatar)
            .setTimestamp()
            .setColor('#eab3fa')

        message.channel.send(embed)
    }
}