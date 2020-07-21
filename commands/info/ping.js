const Discord = require("discord.js");

module.exports = {
    name: "ping",
    aliases: ["pong"],
    cooldown: 2,
    category: "info",
    description: "Mostra o ping do bot e de sua API",
    usage: "m!ping",
    run: async (client, message, args) => {

        const m = await message.channel.send("Ping?");
        
        let avatar = message.author.displayAvatarURL({ format: "png" });
        
        const embed = new Discord.MessageEmbed()
        .setTitle("🏓 | Pong!")
        .addField('📡 | Latência:', `**${m.createdTimestamp - message.createdTimestamp}ms**`)
        .addField('📡 | Latência da API:',`**${Math.round(client.ws.ping)}ms**`)
        .setFooter(message.author.tag, avatar)
        .setTimestamp()
        .setColor('#eab3fa')
        
        m.edit('', embed);

        }
}

