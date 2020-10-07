const {MessageEmbed} = require("discord.js");
module.exports = {
  name: "report",
  aliases: ["reportar", "bug"],
  cooldown: 5,
  category: "util",
  description: "Reporte um Bug para minha Dona",
  userPermission: null,
  clientPermission: null,
  usage: "m!report <bug>",
  run: async (client, message, args) => {
  
  const argumentos = args.join(" ");
   var cor = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
  
  if(!argumentos) return message.channel.send("<:atencao:759603958418767922> | Encontrou um erro/bug? o que aconteceu? Dê-me detalhes");
  
    const embed = new MessageEmbed()
    .setDescription(`${argumentos}`)
    .setColor(cor)
    .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
    .setFooter(`ID do usuário: ${message.author.id}`)
    .setTimestamp()
    .setAuthor(`Novo Bug Reportado por ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}));
  
  client.guilds.cache.get('717061688460967988').channels.cache.get('730906866896470097').send(embed);

  if(message.deletable) message.delete()
  message.channel.send("<:positivo:759603958485614652> | Mutissimo obrigada por reportar este bug para minha dona");
}};
