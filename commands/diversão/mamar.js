const Discord = require("discord.js");

const user = require("../../models/user.js");

module.exports = {
  name: "mamar",
  aliases: ["mame", "sugada", "chupar", "chupa", "glubglub", "suck"],
  cooldown: 2,
  category: "diversão",
  description: "Da aquela mamada de qualidade monstra",
  usage: "m!mamar <@menção>",
  run: async (client, message, args) => {

  const pessoa = message.mentions.users.first();
  const autor = message.author;
  
  if (!pessoa) return message.channel.send("KKK ala o autista mamando o nada");

  if (pessoa.bot) {
    message.channel.send( `${message.author} acabou de sujar a boca de óleo mamano o bot ${pessoa}`);
    return;
  }

  if (pessoa == message.author)
    return message.reply("Não tenta me enganar, eu sei que tu não consegue mamar a si mesmo! Marque outra pessoa para mamar");

  var list = [
    "https://i.imgur.com/PlAtqkk.gif",
    "https://i.imgur.com/LjuLhYq.gif",
    "https://i.imgur.com/zvZ2AiM.gif",
    "https://i.imgur.com/xRBDmXD.gif",
    "https://i.imgur.com/JF5FaNC.gif",
    "https://i.imgur.com/ZAx2dOC.gif",
    "https://i.imgur.com/t1aaEMY.gif",
    "https://i.imgur.com/GEB31Fi.gif",
    "https://i.imgur.com/OMzXpXR.gif",
    "https://i.imgur.com/9DYjWtP.gif",
    "https://i.imgur.com/5Tjpori.gif",
    "https://i.imgur.com/vejOIZc.gif",
    "https://i.imgur.com/qyjOnix.gif",
    "https://i.imgur.com/J3K2d9A.gif",
    "https://i.imgur.com/JgXWxWf.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let userA = message.mentions.users.first();
  let avatar = message.author.displayAvatarURL({ format: "png" });
  const embed = new Discord.MessageEmbed()
    .setTitle("Mamar")
    .setColor("#000000")
    .setDescription(`${message.author} Mamou ${userA}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);


   //mongodb 
    user.findOne({id: pessoa.id}, (err, mamadas) => {
      if(err) console.log(err);
      if(!mamadas){
        const novoUser = new user({
          id: pessoa.id,
          nome: pessoa.username,
          mamadas: 1,
          mamou: 0
        })
        novoUser.save().catch(err => console.log(err))
      } else {
        mamadas.mamadas = mamadas.mamadas + 1;
        mamadas.save().catch(err => console.log(err))
      }
    });

    user.findOne({id: autor.id}, (err, mamou) => {
      if(err) console.log(err);
      if(!mamou){
        const novoUser = new user({
          id: autor.id,
          nome: autor.username,
          mamadas: 0,
          mamou: 1
        })
        novoUser.save().catch(err => console.log(err))
      } else {
        mamou.mamou = mamou.mamou + 1;
        mamou.save().catch(err => console.log(err))
      }
    });

}};
