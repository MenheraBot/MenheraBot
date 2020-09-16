const Discord = require("discord.js");
module.exports = {
  name: "sugerir",
  aliases: ["suggest", "sugira", "dica","sugestão"],
  cooldown: 5,
  category: "util",
  description: "Sugira algo para a dona do bot ou envie um bug para ela",
  usage: "m!sugerir <sugestão>",
  run: async (client, message, args) => {
  
  const argumentos = args.join(" ");
   var cor = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
  
  if(!argumentos) return message.reply("Digite o que quer sugerir para a Lux sobre o bot");
  
    const embed = new Discord.MessageEmbed()
    .setDescription(`**${argumentos}**`)
    .setColor(cor)
    .setThumbnail(message.author.displayAvatarURL())
    .setFooter(`ID do usuário: ${message.author.id}`)
    .setTimestamp()
    .setAuthor(`Sugestão de ${message.author.tag}`, message.author.displayAvatarURL());
  
  client.guilds.cache.get('717061688460967988').channels.cache.get('723765136648830996').send(embed);

  if(message.deletable) message.delete()
  message.reply("Mutissimo obrigada por me enviar uma sugestão <3");
}};
