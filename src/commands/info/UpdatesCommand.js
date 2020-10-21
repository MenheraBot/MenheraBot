const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class UpdatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: "update",
            aliases: ["updates"],
            cooldown: 5,
            description: "Veja as minhas últimas atualzações",
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run(message, args) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])

        const embed = new MessageEmbed()
            .setTitle(`Notas de atualização da versão ${require("../../../package.json").version}`)
            .setColor('#a7e74f')
            .setFooter(`${this.client.user.username} foi atualizada por ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(`**ATUALIZAÇÃO DO CÓDIGO**

            A Menhera foi reescrita para diminuir sua memória e processamento!

            Ela ainda está em fase de testes, erros podem ser frequentes
          
  `)

        message.channel.send(message.author, embed)

    }
}