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
            .setDescription(`**UPDATES**

            • RPG: 
                   O ferreiro aprendeu a fazer uma nova arma e uma nova armadura!
            
            • Código-fonte
                   Devido as mudanças dos intents do Discord, a Menhera não pode mais adicionar ao cache todos os usuários!
            Isso retira a contagem de usuários dela, mas foi até que bom, ja que com 170k usuários em cache a RAM da Menhera ficava certa de 500MB, e agora, com o cache com menos de 5k users, sempre fazendo uma nova requisição quando precisa acessar um usuário, ela gasta cerca de 100MB de Ram, o que vai melhorar MUITO o desemprenho dela
            
            • API
                  Implementei um servidor HTTP na Menhera para me ajudar na administração dos processos, como os logs de status (que serão super úteis quando a Menhera necessitar shards...) 
          
  `)

        message.channel.send(message.author, embed)
    }
}