const { MessageEmbed } = require("discord.js");

const user = require("../../models/user.js");

module.exports = {
    name: "top",
    aliases: ["lb", "leaders", "leaderboard", "rank"],
    cooldown: 20,
    category: "info",
    description: "Veja o top de meus usuários",
    usage: "m!top [demônios | mamadores | mamados]",
    run: async (client, message, args) => {
        
        const argumento = args[0]; 
        if(!argumento) return message.reply("Você deve escolher entre `m!top mamadores`, `m!top mamados` ou `m!top caçadores`")

        let argsCaçar = ["caçadores", "caçados", "demonios", "demônios", "demonio", "demônio", "hunters"];
        let argsMamou = ["mamou", "mamadores"];
        let argsMamados = ["mamados", "chupados"];

        if(argsCaçar.includes(argumento)){
            topDemonios(client, message)
        } else if(argsMamou.includes(argumento)){
            topMamadores(client, message)
        } else if(argsMamados.includes(argumento)){
            topMamados(client, message)
        } else message.reply("Você deve escolher entre `m!top mamadores`, `m!top mamados` ou `m!top caçadores`")

 }}

    function topMamados(client, message){

        let embed = new MessageEmbed()
        
        .setTitle("👑 | Placar de Mamados")
        .setColor('#eab3fa')

        user.find({}, ['mamadas', 'nome', 'id'], {
            skip:0, 
            limit:10, 
            sort:{ mamadas: -1}
        },
        function(err, res){
            if(err) console.log(err)

            for (i = 0; i < res.length; i++) {
                let member = client.users.cache.get(res[i].id);
                if (!member) {
                    embed.addField(`**${i + 1} -** ${res[i].nome}`, `Mamado: **${res[i].mamadas}**`, false)
                } else {
                    embed.addField(`**${i + 1} -** ${member.username}`, `Mamado: **${res[i].mamadas}**`, false)
                }
            }
            message.channel.send(message.author, embed)
        })
    }

    function topMamadores(client, message){
    
        let embed = new MessageEmbed()
        
        .setTitle("👑 | Placar de Mamadores")
        .setColor('#eab3fa')

        user.find({}, ['mamou', 'nome', 'id'], {
            skip:0, 
            limit:10, 
            sort:{ mamou: -1}
        },
        function(err, res){
            if(err) console.log(err)

            for (i = 0; i < res.length; i++) {
                let member = client.users.cache.get(res[i].id);
                if (!member) {
                    embed.addField(`**${i + 1} -** ${res[i].nome}`, `Mamou: **${res[i].mamou}**`, false)
                } else {
                    embed.addField(`**${i + 1} -** ${member.username}`, `Mamou: **${res[i].mamou}**`, false)
                }
            }
            message.channel.send(message.author ,embed)
        })
    }
    
    function topDemonios(client, message){
        
        let embed = new MessageEmbed()
        
        .setTitle("😈 | Placar de Caçadores")
        .setColor('#e68f31')

        user.find({}, ['caçados', 'nome', 'id'], {
            skip:0, 
            limit:10, 
            sort:{ caçados: -1}
        },
         function(err, res){
            if(err) console.log(err)

            for (i = 0; i < res.length; i++) {
                let member =  client.users.cache.get(res[i].id)
                if (!member) {
                    embed.addField(`**${i + 1} -** ${res[i].nome}`, `Demônios caçados: **${res[i].caçados}**`, false)
                } else {
                    embed.addField(`**${i + 1} -** ${member.username}`, `Demônios caçados: **${res[i].caçados}**`, false)
                }
            }
            message.channel.send(message.author, embed)

        })
    
    }
