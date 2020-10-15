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
            .setDescription(`**Mudanças no RPG**

            • Mudanças do Bárbaro:
            Habilidade 'Grito de Guerra' dano de \`60\` para \`40\`, custo de \`35\` para \`30\`
            Habilidade 'Guilhotina Humana' dano de \`130\` para \`60\`
            Habilidade 'Último Golpe' dano de \`150\` para \`100\`, custo de \`65\` para \`70\`
            
            • Mudanças do Clérigo:
            Habilidade 'Bênção Elemental' cura de \`0\` para \`50\`
            Habilidade 'Castigo Divino' dano de \`0\` para \`9\`
            Habilidade 'Ascensão Espiritual' custo de \`80\` para \`90\`
            
            • Mudanças no Espadachim 
            Habilidade 'Combate Tático' dano de \`50\` para \`35\` custo de \`40\` para \`30\`
            Habilidade 'Excalibur' dano de \`60\` para \`55\`
            Habilidade 'Kenjutsu' dano de \`70\` para \`90\`
            
            • Mudanças do Monge
            Habilidade 'Silêncio Mortal' dano de \`70\` para \`70\`
            
            **HOTEL**
            • Removida a opção 'Sono Pesado'
             • Soninho do almoço passa para 2 horas
            • Adicionada 2 novas opções para restaurar vida e mana
            
            
  `)

        message.channel.send(message.author, embed)
    }
};