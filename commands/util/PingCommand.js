const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "ping",
    aliases: ["pong"],
    cooldown: 2,
    category: "util",
    description: "Mostra o ping do bot e de sua API",
    userPermission: null,
  clientPermission: ["EMBED_LINKS"],
    usage: "m!ping",
    run: async (client, message, args) => {
        
        let avatar = message.author.displayAvatarURL({ format: "png" });
        
        const embed = new MessageEmbed()
        .setTitle("🏓 | Pong!")
        .addField('📡 | Latência:', `**${Math.round(client.ws.ping)}ms**`)
        .addField('📡 | Latência da API:',`**${Date.now() - message.createdTimestamp}ms**`)
        .setFooter(message.author.tag, avatar)
        .setTimestamp()
        .setColor('#eab3fa')
        
        message.channel.send(embed)

        }
}

