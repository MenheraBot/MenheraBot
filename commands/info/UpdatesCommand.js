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
            .setDescription(`**Atualizações Para o RPG**

            Esta atualização serve para adicionar sugestões e novidades para os níveis mais altos!
            
            • A partir do lvl 20, você pode optar por batalhar contra bosses, com m!boss, ao invés da convencional dungeon
            
            • Os bosses são mais fortes, mas seus loots valem mais de 1k cada (Chequem no final os bosses)
            
            • Sugestões da galera: \`Adicionado o dano das escolhas ao lado do custo na dungeon\`, \`Agora você pode escolher a quantidade de poções que quer usar no m!usar\`, \`Reduzido o cooldown do m!usar\` Sugeridos por: <@291600027246264322>
            
            (Eu já sei do bug do m!top famílias, e já to investigando isso)
            
            **BOSSES:**
            
            • Apolo: 
            :heart: 1000, :dagger: 160, :shield: 150, :beginner:35000, Loots: 780 :gem:, 1320 :gem: 
            
            • Loki:
            :heart: 700, :dagger: 186, :shield: 180, :beginner:35000, Loots: 380:gem:, 1250:gem: 
            
            • Soma:
            :heart: 500, :dagger: 200, :shield: 200, :beginner:50000, Loots: 1000:gem:, 1400:gem: 
            
            • Freya: 
            :heart: 840, :dagger: 178, :shield: 190, :beginner:45000, Loots: 1450:gem:, 1320:gem: 
            
            • Ares: 
            :heart: 1800, :dagger: 150, :shield: 150, :beginner:60000, Loots: 988:gem:, 1700:gem: 
  `)

        message.channel.send(message.author, embed)
    }
};