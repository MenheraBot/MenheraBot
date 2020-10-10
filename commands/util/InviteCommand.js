const {
  MessageEmbed
} = require("discord.js");
module.exports = {
  name: "invite",
  aliases: ["adicionar"],
  cooldown: 2,
  category: "util",
  dir: 'InviteCommand',
  description: "Adicione o bot em algum servidor",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!invite",
  run: async (client, message, args) => {
    const embed = new MessageEmbed()
      .setTitle("Clique para me adicionar em algum servidor")
      .setColor('#f763f8')
      .setURL("https://discord.com/api/oauth2/authorize?client_id=708014856711962654&permissions=1007025271&scope=bot")
      .setImage("https://i.imgur.com/ZsKuh8W.png")
      .setDescription("Este link te levará direto para a página do discord para adicionar o bot em algum servidor que você administre")
      .setFooter(`Comando executado por ${message.author.tag}`, message.author.displayAvatarURL())
      .setTimestamp()

    message.channel.send(embed).catch(err => console.log(err));

  }
};