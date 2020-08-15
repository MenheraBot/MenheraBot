const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "votar",
  aliases: ["vote", "vota", "upvote"],
  cooldown: 2,
  category: "info",
  description: "Vote no bot (pfv vote, isso ajuda muito X3 >.< )",
  usage: "m!votar",
  run: async (client, message, args) => {
  const embed = new MessageEmbed()
  .setTitle("Clique para votar em mim")
  .setColor('#f763f8')
  .setURL("https://top.gg/bot/708014856711962654/vote")
  .setImage("https://i.imgur.com/ZsKuh8W.png")
  .setDescription("Votos ajudam na divulgação do bot, e isso é extremamente importante")
  .setFooter(`Comando executado por ${message.author.tag}`, message.author.displayAvatarURL())
  .setTimestamp()

  message.channel.send(embed);
  message.react(':apaixonada:727975782034440252')
}};
