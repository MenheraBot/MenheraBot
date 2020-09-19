const Discord = require("discord.js");
module.exports = {
    name: "suporte",
    aliases: ["servidor"],
    cooldown: 5,
    category: "util",
    description: "Link de convite para o servidor de suporte do Bot",
    usage: "m!suporte",
    run: async (client, message, args) => {
 const embed = new Discord.MessageEmbed()
 .setTitle("Clique aqui para entrar no servidor de suporte da Menhera")
 .setURL('https://discord.gg/fZMdQbA')
 .setColor('#970045')
 .setImage("https://i.imgur.com/ZsKuh8W.png")
 .setFooter(`Comando executado por ${message.author.tag}`, message.author.displayAvatarURL())
 .setTimestamp()
 message.channel.send(message.author, embed);
    }
};
