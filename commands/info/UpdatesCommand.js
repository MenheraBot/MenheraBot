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
            .setDescription(`**Impossible Mobs Updates**

            • O dano dos mobs 'Impossíveis' foi aumentado:
                   Deus dos Minotauros de \`80\` para \`85\`
                   Malthael de \`112\` para \`120\`
                   Kraken de \`87\` para \`99\`  
  `)

        message.channel.send(message.author, embed)
    }
};