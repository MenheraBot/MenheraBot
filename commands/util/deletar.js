const Discord = require("discord.js");
const user = require("../../models/user.js");

module.exports = {
  name: "deletar",
  aliases: ["delete", "excluir"],
  cooldown: 5,
  category: "util",
  description: "Exclua seu perfil do banco de dados",
  usage: "m!deletar",
  run: async (client, message, args) => {
  
    message.channel.send(`Você tem certeza que deseja excluir sua conta da database do servidor?\nVocê tem 5 segundos para decidir`).then(msg => {
      
        msg.react("✅").catch(err => message.channel.send("Ocorreu um erro ao adicionar uma reação, serasi eu tenho permissão para tal?"));
        msg.react("❌").catch(err => message.channel.send("Ocorreu um erro ao adicionar uma reação, serasi eu tenho permissão para tal?"));

        let filter = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === message.author.id;
        let filter1 = (reação, user) => reação.emoji.name === "❌" && user.id === message.author.id;

        let ncoletor = msg.createReactionCollector(filter1, { max: 1,time: 5000 });
        let coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 });

        ncoletor.on("collect", co => {
          msg.reactions.removeAll().catch(error => console.error("ERRO AO EXCLUIR AS REAÇÕES", error));
          message.channel.send( `Perfeito!! Seu perfil **não** foi excluído`);
        });

        coletor.on("collect", cp => {
          msg.reactions.removeAll().catch(error => console.error("ERRO AO EXCLUIR AS REAÇÕES", error));
        
          user.findOneAndDelete({id: message.author.id}, (err, res) => {
            if(err) console.log(err);
            message.channel.send(`Seu perfil foi deletado da minha database :(`);
          })
        })
        setTimeout(() => {
         msg.delete().catch(err => console.log(err));
      }, 5050);
      })
    }
 } 

        
