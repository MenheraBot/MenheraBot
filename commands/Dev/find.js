const Discord = require("discord.js");

module.exports = {
    name: "find",
    aliases: ["achar"],
    cooldown: 2,
    category: "Dev",
    description: "Arquivo destinado para testes",
    usage: "m!find <user|server> <id>",
    run: async (client, message, args) => {
        if(message.author.id !== '435228312214962204') return message.channel.send("Este comando é único de minha dona!")

        const action = args[0];
        const id = args[1];
        let embed = new Discord.MessageEmbed();

        switch(action){
            case 'user':
                if(!id) return message.channel.send("Não me foi dado nenhum id");
                findUser(client, id, message, embed);
                break;
            case 'server':
                if(!id) return message.channel.send("Não me foi dado nenhum id");
                findServer(client, id, message, embed);
                break;
            default:
                message.channel.send("Você só pode procurar por `user` ou `server`");
        }
    }}

    function findUser(client, id, message, embed){

        const userFound = client.users.cache.get(id);

        if(!userFound) {
            embed.setColor('#ff0000')
            embed.setTitle("Nenhum usuário encontrado :(")
             return message.channel.send(embed)
        } else {
            embed.setColor('#c277ff')
            embed.setTitle(userFound.username)
            embed.setDescription(`**Usuário:** '${userFound.tag}'\n\n**Id:** \`${id}\`\n\n**Presença:** ${userFound.presence.status}`)
            embed.setFooter(`Conta criada em ${userFound.createdAt}`)
            embed.setThumbnail(userFound.displayAvatarURL())
            return message.channel.send(embed);
        }
        
    }

    function findServer(client, id, message, embed){

        const serverFound = client.guilds.cache.get(id);

        if(!serverFound) {
            embed.setColor('#ff0000')
            embed.setTitle("Nenhum servidor encontrado :(")
             return message.channel.send(embed)
        } else {
            embed.setColor('#7bf06c')
            embed.setTitle(serverFound.name)
            embed.setDescription(`**Id:** \`${id}\`\n\n**Região:** ${serverFound.region}\n\n**Dono:** ${serverFound.owner} | \`${serverFound.ownerID}\`\n\n**Membros:** ${serverFound.memberCount}`)
            embed.setFooter(`Servidor criado em ${serverFound.createdAt}`)
            embed.setThumbnail(serverFound.iconURL())
            return message.channel.send(embed);
        }
    }