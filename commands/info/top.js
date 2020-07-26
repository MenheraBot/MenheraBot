const Dscord = require("discord.js");

const user = require("../../models/user.js");

module.exports = {
    name: "top",
    aliases: ["lb", "leaders", "leaderboard", "rank"],
    cooldown: 20,
    category: "info",
    description: "Veja a tabela de líderes de mamadas",
    usage: "m!top",
    run: async (client, message, args) => {

        user.find().sort([['mamadas', 'descending']]).exec((err, res) => {
            if (err) console.log(err);
            let embed1 = new Dscord.MessageEmbed()
                .setTitle("👑 | Placar de Mamados")
                

            if (res.length === 0) {
                embed1.setColor('#ff0000')
                embed1.addField("Nenhuma data encontrada", "Eu não sei o que aconteceu, mas nenhum perfil foi encontrado")
            } else if (res.length < 10) {
                embed1.setColor('#a788ff')
                for (i = 0; i < res.length; i++) {
                    let member = client.users.cache.get(res[i].id);
                    if (!member) {
                        embed1.addField(`${i + 1}° ${res[i].nome}`, `Mamado: ${res[i].mamadas}`, false)
                    } else {
                        embed1.addField(`${i + 1}° ${member.username}`, `Mamado: ${res[i].mamadas}`, false)
                    }
                }
            } else {
                embed1.setColor('#eab3fa')
                for (i = 0; i < 10; i++) {
                    let member = client.users.cache.get(res[i].id);
                    if (!member) {
                        embed1.addField(`${i + 1}° ${res[i].nome}`, `Mamado: ${res[i].mamadas}`, false)
                    } else {
                        embed1.addField(`${i + 1}° ${member.username}`, `Mamado: ${res[i].mamadas}`, false)
                    }
                }

            }
            let avatar = message.author.displayAvatarURL({ format: "png" });
                let embed = new Dscord.MessageEmbed()
                .setTitle("👑 | Placar de Mamadores")
                .setColor('#eab3fb')
                .setFooter(message.author.tag, avatar)
                .setTimestamp()
            user.find().sort([['mamou', 'descending']]).exec((err, ress) => {
                if (err) console.log(err);
                if (res.length < 10) {
                    for (i = 0; i < ress.length; i++) {
                        let memberr = client.users.cache.get(ress[i].id);
                        if (!memberr) {
                            embed.addField(`${i + 1}° ${ress[i].nome}`, `Mamou: ${ress[i].mamou}`, false)
                        } else {
                            embed.addField(`${i + 1}° ${memberr.username}`, `Mamou: ${ress[i].mamou}`, false)
                        }
                    }
                  
                } else {
                    for (i = 0; i < 10; i++) {
                        let memberr = client.users.cache.get(ress[i].id);
                        if (!memberr) {
                            embed.addField(`${i + 1}° ${ress[i].nome}`, `Mamou: ${ress[i].mamou}`, false)
                        } else {
                            embed.addField(`${i + 1}° ${memberr.username}`, `Mamou: ${ress[i].mamou}`, false)
                        }
                    }
    
                } 
                message.channel.send(embed1);
                message.channel.send(embed)
            });   
        });
    }
}
