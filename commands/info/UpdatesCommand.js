const {
    MessageEmbed
} = require("discord.js");

const config = require('../../config.json')

module.exports = {
    name: "update",
    aliases: ["atualização"],
    cooldown: 5,
    category: "info",
    dir: 'UpdatesCommand',
    description: "Veja as minhas últimas atualzações",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!updates",
    run: async (client, message, args) => {

        const owner = await client.users.fetch(config.owner[0])

        const embed = new MessageEmbed()
            .setTitle(`Notas de atualização da versão ${require("../../package.json").version}`)
            .setColor('#a7e74f')
            .setFooter(`${client.user.username} foi atualizada por ${owner.tag}`, owner.displayAvatarURL({
                format: "png",
                dynamic: true
            }))
            .setDescription(`**Banco da Família**

            Para melhorar as famílias, seus membros devem depositar pedras preciosas ao banco da familia
            
            • Use m!depositar valor para depositar seu dinheiro no banco da família
            
            • Quando a família Upar, será notificado no <#730903350169698314> em meu servidor de suporte
            
             
  `)

        message.channel.send(message.author, embed)
    }
};