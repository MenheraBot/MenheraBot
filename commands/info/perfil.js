const {MessageEmbed} = require("discord.js");

const user = require("../../models/user.js");

module.exports = {
  name: "perfil",
  aliases: ["profile"],
  cooldown: 10,
  category: "info",
  description: "Veja o seu perfil, ou o de alguem",
  usage: "m!perfil [@menção]",
  run: async (client, message, args) => {

  let pessoa = message.mentions.users.first() || client.users.cache.get(args[0]);
  if (!pessoa) pessoa = message.author;
    
  if (pessoa.bot) return message.channel.send("Que? KKK fodase os bots, robôs não tem perfil");

  let embed = new MessageEmbed()
  .setTitle(`${pessoa.username}`)
  .setThumbnail(pessoa.displayAvatarURL({dynamic: true}))

  user.findOne({id: pessoa.id}, (err, info) => {
    if(err) console.log(err);
    if(!info) return message.reply(`Este usuário não possui perfil!\nUtilize 'm!mamar ${pessoa}' para adicioná-lo à minha database`)
    if(info.ban) return message.reply(`Este usuário está **banido** de usar a Menhera\n**Motivo:** \`${info.banReason}\``)
    let mamadas = info.mamadas || 0;
    let mamou = info.mamou || 0;
    let nota = info.nota || `Sem Nota`;
    let cor = info.cor || '#a788ff';

    embed.setColor(cor)

    embed.addFields([{
      name: "👅 | Mamou",
      value: mamou,
      inline: true
  }, 
  {
      name: "❤️ | Mamado",
      value: mamadas,
      inline: true
  }
  ]);

    if(info.casado && info.casado != "false"){
      let persona = client.users.cache.get(info.casado) || "`Sem informações do usuário`";
      let data = info.data || "Sem data registrada";
      embed.addFields([{
          name: "💗 | Casado com",
          value: persona,
          inline: true
      }, 
      {
          name: "💍 | Casados em",
          value: data,
          inline:true
      }
    ]);
    }
    embed.addField(`<:apaixonada:727975782034440252> | Sobre Mim`, nota, true);

    message.channel.send(message.author, embed);
  })

}};
