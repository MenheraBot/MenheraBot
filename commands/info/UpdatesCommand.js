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
            .setDescription(`**Pequenas mudanças no RPG**

            • Bárbaro
            Custo da habilidade 'Guilhotina Humana' de \`50\` para \`55\`
            Dano da habilidade 'Último Golpe' de \`100\` para \`112\`
            
            • Morte
            O tempo de morte foi reduzido pela metade! Antes, ao morrer, você ficava descansando por 24 horas, agora, caso morra, você descansa por **12 horas**
            
            • Ajuste dos Bosses
            Xp da Soma de \`50000\` para \`35000\`
            Xp do Apolo de \`35000\` para \`50000\`
            
            
  `)

        message.channel.send(message.author, embed)
    }
};