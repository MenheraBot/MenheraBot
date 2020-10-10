const { MessageEmbed } = require("discord.js");

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
            .setFooter(`${client.user.username} foi atualizada por ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(`**RPG Updates**

  • Assassinos Nerfados:
        Custo da Habilidade Jack de \`50\` para \`60\`
        Custo da Habilidade Atrás de Você! de \`68\` para \`80\`
  
  • Mobs Impossíveis: 
       XP do Lobisomem do Inferno de \`27666\` para \`20111\`
       Malthael: Armadura de \`80\` para \`70\` e XP de \`33333\` para \`38666\`
      Xp do Kraken de \`15600\` para \`27500\`
      
  • NOVO MOB IMPOSSÍVEL: 
  
  Vouivre
  680:drop_of_blood: 
  100:crossed_swords:
  50:shield:
  `)

        message.channel.send(message.author, embed)
    }
};
