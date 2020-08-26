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

            message.channel.startTyping();
            let avatar = message.author.displayAvatarURL({ format: "png" });
            user.find().sort([['mamadas', 'descending']]).exec((err, res) => {
            if (err) console.log(err);
            let avatar = message.author.displayAvatarURL({ format: "png" });
            let embed1 = new Dscord.MessageEmbed()
                .setTitle("👑 | Placar de Mamados")
                embed1.setColor('#eab3fa')
                .setFooter(message.author.tag, avatar)
                for (i = 0; i < 5; i++) {
                    let member = client.users.cache.get(res[i].id);
                    if (!member) {
                        embed1.addField(`**${i + 1} -** ${res[i].nome}`, `Mamado: ${res[i].mamadas}`, false)
                    } else {
                        embed1.addField(`**${i + 1} -** ${member.username}`, `Mamado: ${res[i].mamadas}`, false)
                    }
                }
                let embed = new Dscord.MessageEmbed()
                .setTitle("👑 | Placar de Mamadores")
                .setColor('#eab3fb')
                .setTimestamp()
            user.find().sort([['mamou', 'descending']]).exec((err, ress) => {
                if (err) console.log(err);
                    for (i = 0; i < 5; i++) {
                        let memberr = client.users.cache.get(ress[i].id);
                        if (!memberr) {
                            embed.addField(`**${i + 1} -** ${ress[i].nome}`, `Mamou: ${ress[i].mamou}`, false)
                        } else {
                            embed.addField(`**${i + 1} -** ${memberr.username}`, `Mamou: ${ress[i].mamou}`, false)
                        }
                    }
                message.channel.send(embed)
                message.channel.send(embed1).then(err => message.channel.stopTyping());
            });   
        });
    }
}
