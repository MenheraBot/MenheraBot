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
            .setDescription(`:map:  **| TRADUÇÃO**

            • Terminei de adaptar o código da Menhera para receber a tradução para inglês!
            
            Vou lançar o código somente em português para ver todos os erros de digitação e tudo mais
            
            • Caso encontre algum erro na tradução, denuncie com #🚨╽bug-report 
            
            Um exemplo de problema de tradução é quando um texto aparece tipo assim: \`dataRolls_fields.title\`
          
  `)

        message.channel.send(message.author, embed)
    }
}