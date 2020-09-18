const Dscord = require("discord.js");

const user = require("../../models/user.js");

module.exports = {
    name: "top",
    aliases: ["lb", "leaders", "leaderboard", "rank"],
    cooldown: 20,
    category: "info",
    description: "Veja a tabela de líderes de mamadas ou de demonios",
    usage: "m!top [demônios]",
    run: async (client, message, args) => {

        const argumento = args[0];
        let argumentosValidos = [
            "caçadores",
            "caçados",
            "demonios",
            "demônios",
            "demonio",
            "demônio",
            "hunters"
        ];

        (argumentosValidos.includes(argumento)) ? topDemonios(client, message) : message.reply("Este comando foi desativado temporariamente por problemas de alocação de memória")  //topMamadores(client, message);

    }}

    function topMamadores(client, message){
        
        message.channel.startTyping();

        user.find().sort([['mamadas', 'descending']]).exec((err, res) => {
        if (err) console.log(err);
        let embed1 = new Dscord.MessageEmbed()
            .setTitle("👑 | Placar de Mamados")
            embed1.setColor('#eab3fa')
            .setFooter("Para ver o top de Demônios caçados, use m!top demônios")
            for (i = 0; i < 5; i++) {
                let member = client.users.cache.get(res[i].id);
                if (!member) {
                    embed1.addField(`**${i + 1} -** ${res[i].nome}`, `Mamado: **${res[i].mamadas}**`, false)
                } else {
                    embed1.addField(`**${i + 1} -** ${member.username}`, `Mamado: **${res[i].mamadas}**`, false)
                }
            }
            let embed = new Dscord.MessageEmbed()
            .setTitle("👑 | Placar de Mamadores")
            .setColor('#eab3fb')
        user.find().sort([['mamou', 'descending']]).exec((err, ress) => {
            if (err) console.log(err);
                for (i = 0; i < 5; i++) {
                    let memberr = client.users.cache.get(ress[i].id);
                    if (!memberr) {
                        embed.addField(`**${i + 1} -** ${ress[i].nome}`, `Mamou: **${ress[i].mamou}**`, false)
                    } else {
                        embed.addField(`**${i + 1} -** ${memberr.username}`, `Mamou: **${ress[i].mamou}**`, false)
                    }
                }
            message.channel.send(embed)
            message.channel.send(embed1)
            message.channel.stopTyping();
        });   
    });
    }
    
    function topDemonios(client, message){

        
        message.channel.startTyping();

        let embed = new Dscord.MessageEmbed()
        .setTitle("😈 | Placar de Caçadores")
        .setColor('#e68f31')
    user.find().sort([['caçados', 'descending']]).exec((err, res) => {
        if (err) console.log(err);
            for (i = 0; i < 10; i++) {
                let member = client.users.cache.get(res[i].id);
                if (!member) {
                    embed.addField(`**${i + 1} -** ${res[i].nome}`, `Demônios caçados: **${res[i].caçados}**`, false)
                } else {
                    embed.addField(`**${i + 1} -** ${member.username}`, `Demônios caçados: **${res[i].caçados}**`, false)
                }
            }
        message.channel.send(embed)
        message.channel.stopTyping();
    }); 
    }
