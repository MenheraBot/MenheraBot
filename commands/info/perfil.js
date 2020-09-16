const Discord = require("discord.js");

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

  let embed = new Discord.MessageEmbed()
  .setTitle(`${pessoa.username}`)
  .setColor('#a788ff')
  .setThumbnail(pessoa.displayAvatarURL())

  user.findOne({id: pessoa.id}, (err, info) => {
    if(err) console.log(err);
    if(!info) return message.reply(`Este usuário não possui perfil!\nUtilize 'm!mamar ${pessoa}' para adicioná-lo à minha database`)

    let mamadas = info.mamadas || 0;
    let mamou = info.mamou || 0;
    let life = info.status || "Vivo";
    let demons = info.caçados || 0;

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
  ], 
    [{
    name: "🩸 | Status",
    value: life,
    inline: true
    },
    {
      name: "😈 | Demônios Caçados",
      value: demons,
      inline:true
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
    if(info.nota != undefined) embed.setFooter(`Nota: ${info.nota}`)
    if(info.verified){
      embed.setColor('#10e0e5')
      embed.setTitle(`<:verified:751627308527255662> | ${pessoa.username}`)
    }

    message.reply(embed);
  })

}};
