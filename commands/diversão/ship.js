const {MessageEmbed} = require("discord.js");

module.exports = {
  name: "ship",
  aliases: ["shippar", "shipar", "amor", "crush"],
  cooldown: 5,
  category: "diversão",
  description: "Descubra o quanto alguém te ama",
  usage: "m!ship <@menção>",
  run: async (client, message, args) => {

    let pessoa = message.mentions.users.first() || args[0];

    if(!pessoa){
        return message.reply("Com quem você quer se shippar?")
    }

    const love = Math.random() * 100;
    const loveIndex = Math.floor(love / 10);
    const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);    

    const embed = new MessageEmbed()
    .setColor("#ffb6c1")
    .setThumbnail(pessoa.displayAvatarURL())
    .addField(`☁ **${pessoa.username}** ama **${message.author.username}** esse tanto:`,
    `💟 ${Math.floor(love)}%\n\n${loveLevel}`);

    message.reply(embed);
}}
