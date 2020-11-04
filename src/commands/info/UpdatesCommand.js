const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const version = require("../../../package.json").version
module.exports = class UpdatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: "updates",
            aliases: ["update"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run({ message, args, server }, t) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])

        const embed = new MessageEmbed()
            .setTitle(`${t("commands:updates.title")} ${version}`)
            .setColor('#a7e74f')
            .setFooter(`${this.client.user.username} ${t("commands:updates.footer")} ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(`**POÇÕES**
            • Mudanças no sistema de poções:
            Agora os níveis maximos voltaram!
            Adicionado mais poções a partir do nivel 25
        `)

        message.channel.send(message.author, embed)
    }
}