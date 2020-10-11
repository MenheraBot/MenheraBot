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
            .setDescription(`**FAMÍLIAS UPDATES**

            Adicionado o sistema de famílias!
            
            • Cada família possui habilidades e boosts, que podem ser reforçados com ajuda de todos os membros da família
            
            • Para escolher sua família, use \`m!família\`
            
            • Após escolher uma família, você pode ver seus novos status com \`m!status\`
            
            • Os boosts da família somam automaticamente com seus status base, então visualmente, não verás nenhuma mudança
            
            • Com o tempo, vou adicionar funções como:
                  Guerra de famílias
                  Trocas com membros de mesma família
                  Adicionar dinheiro ao banco da família para melhorar os boosts e as habilidades
                  Adicionar ao \`m!top\` as famílias mais fortes!
                  Criar um comando para ver as informações das famílias
             
  `)

        message.channel.send(message.author, embed)
    }
};