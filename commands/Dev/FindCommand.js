const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "find",
    aliases: [],
    cooldown: 2,
    dir: 'FindCommand',
    category: "Dev",
    description: "Retorna um servidor ou um usuario",
    userPermission: null,
  clientPermission: ["EMBED_LINKS"],
    usage: "m!find <user|server> <id>",
    devsOnly: true,
    
    run: async (client, message, args) => {

        const action = args[0];
        const id = args[1];
        let embed = new MessageEmbed();

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
            embed.setDescription(`**ServerID:** \`${id}\`\n\n**Região:** ${serverFound.region}\n\n**Dono:** ${client.users.cache.get(serverFound.ownerID).tag} | \`${serverFound.ownerID}\`\n\n**Membros:** ${serverFound.memberCount}`)
            embed.setFooter(`Servidor criado em ${serverFound.createdAt}`)
            embed.setThumbnail(serverFound.iconURL())
            return message.channel.send(embed);
        }
    }