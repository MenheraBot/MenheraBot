const user = require("../../models/user.js");

module.exports = {
  name: "deletar",
  aliases: ["delete"],
  cooldown: 30,
  dir: 'DeleteCommand',
  category: "util",
  description: "Exclua seu perfil do banco de dados",
  userPermission: null,
  clientPermission: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"],
  usage: "m!deletar",
  run: async (client, message, args) => {
  
    message.channel.send(`<:atencao:759603958418767922> |Você tem certeza que deseja excluir sua conta da database do servidor?\nVocê tem 5 segundos para decidir`).then(async msg => {
      
        msg.react("✅").catch();
        msg.react("❌").catch();

        let filter = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === message.author.id;
        let filter1 = (reação, user) => reação.emoji.name === "❌" && user.id === message.author.id;

        let ncoletor = msg.createReactionCollector(filter1, { max: 1,time: 5000 });
        let coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 });

        ncoletor.on("collect", co => {
          msg.reactions.removeAll().catch();
          message.channel.send(`<:positivo:759603958485614652> | Perfeito!! Seu perfil **não** foi excluído`);
        });

        coletor.on("collect", cp => {
          msg.reactions.removeAll().catch();
        
          user.findOneAndDelete({id: message.author.id}, (err, res) => {
            if(err) console.log(err);
            message.channel.send(`<:positivo:759603958485614652> | Seu perfil foi deletado da minha database :(`);
          })
        })
        setTimeout(() => {
         msg.delete().catch();
      }, 5050);
      })
    }
 } 

        
