const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class UpdatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: "update",
            aliases: ["updates"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run({ message, args, server }, t) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])

        const embed = new MessageEmbed()
            .setTitle(`${t("commands:updates.title")} ${require("../../../package.json").version}`)
            .setColor('#a7e74f')
            .setFooter(`${this.client.user.username} ${t("commands:updates.footer")} ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(`**NOVO COMANDO**

            • Adicionado o comando lembrete!

            Use m!lembrete <texto para lembrar>, então, passe quando será avisado
            ATENÇÃO: Você deve passar o número junto da letra correspondente ao tempo
            Exemplo: 5d 2m (para ser lembrado daqui a cinco dias e dois minutos)

            Então, escolha se quer ser lembrado na Dm ou no canal onde foi executado

            O tempo mínimo do lembrete é 5 minutos, e no máximo 7 dias.
  `)

        message.channel.send(message.author, embed)
    }
}