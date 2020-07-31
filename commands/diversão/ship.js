const {MessageEmbed} = require("discord.js");

module.exports = {
  name: "ship",
  aliases: ["shippar", "shipar", "amor", "crush"],
  cooldown: 5,
  category: "diversão",
  description: "Descubra o quanto alguém te ama",
  usage: "m!ship <@menção> <@menção>",
  run: async (client, message, args) => {

    let pessoa = message.mentions.users.array()[0];
    let pessoa2 = message.mentions.users.array()[1];
     

    if(!pessoa && !pessoa2){
        return message.reply(`é... não é assim que se usa este comando... Utilize ´m!help ship´ para mais informações`)
    }

    let nome1 = pessoa.username;
    let nome2 = pessoa2.username;

    const love = Math.random() * 100;
    const loveIndex = Math.floor(love / 10);
    const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);    

    const embed = new MessageEmbed()
    .setColor("#ffb6c1")
    .setThumbnail(pessoa.displayAvatarURL())
    .addField(`☁ **${nome1}** e **${nome2}** dariam um bom casal?`,
    `💟 ${Math.floor(love)}%\n\n${loveLevel}`);

    message.reply(embed);
}}
