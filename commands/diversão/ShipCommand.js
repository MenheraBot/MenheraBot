const { MessageEmbed } = require("discord.js");
const database = require("../../models/user.js");

module.exports = {
  name: "ship",
  aliases: [],
  cooldown: 2,
  category: "diversão",
  dir: 'ShipCommand',
  description: "Será que vocês dariam um bom casal?",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!ship <usuario> <usuário>",
  run: async (client, message, args) => {

    if (!args[0]) return message.channel.send("Você não mencionou dois usuários")
    if (!args[1]) return message.channel.send("Você não mencionou dois usuários")
    let user1 = await client.users.cache.get(args[0].replace(/[<@!>]/g, ""))
    let user2 = await client.users.cache.get(args[1].replace(/[<@!>]/g, ""))
    if (!user1) return message.channel.send("Usuário nao encontrado na database")
    if (!user2) return message.channel.send("Usuário nao encontrado na database")
    let value1 = await database.findOne({id: user1.id})
    let value2 = await database.findOne({id: user2.id})
    if (!value1) return message.channel.send("Usuário nao encontrado na database")
    if (!value2) return message.channel.send("Usuário nao encontrado na database")

    if (!value1.shipValue || value1.shipValue === 0) {
        value1.shipValue = Math.floor(Math.random() * 55)
        value1.save()
    }
    if (!value2.shipValue || value2.shipValue === 0) {
        value2.shipValue = Math.floor(Math.random() * 55)
        value2.save()
    }
    let value = Number(value1.shipValue) + Number(value2.shipValue)
    if (Number(value) >= 100) {
        value = 100
    }

    let username1 = user1.username
    let username2 = user2.username
    let mix = `${username1.substring(0, username1.length / 2) + username2.substring(username2.length / 2, username2.length)}`.replace(" ", "")

    let embed = new MessageEmbed()
    .setTitle(`${username1} + ${username2} = ${mix}`)
    .setThumbnail('https://i.imgur.com/VGSDWLO.png')
    .setDescription(`\nValor do ship: **` + value.toString() + "%**\n\nTalvez o bot que seja quebrado, ou vocês não darão certo mesmo :(")

    if(Number(value) >= 25 ) embed.setColor('#cadf2a').setThumbnail('https://i.imgur.com/16kRzaC.png').setDescription(`\nValor do ship: **` + value.toString() + "%**\n\nÉ, nada é impossível né k k k")
    if(Number(value) >= 50 ) embed.setColor('#d8937b').setThumbnail('https://i.imgur.com/XkMVoiE.png').setDescription(`\nValor do ship: **` + value.toString() + "%**\n\nMazaaaa casal, ja podem namorar ja")
    if(Number(value) >= 75 ) embed.setColor('#f34a4a').setThumbnail('https://i.imgur.com/XkMVoiE.png').setDescription(`\nValor do ship: **` + value.toString() + "%**\n\nEsses dois já não estão namorando? Pois deveriam")
    if(Number(value) >= 99 ) embed.setColor('#ec2c2c').setThumbnail('https://i.imgur.com/JBVskmZ.png').setDescription(`\nValor do ship: **` + value.toString() + "%**\n\nQue casal magnífico véi, perfeitos apenas")
    if(Number(value) == 100 ) embed.setColor('#ff00df').setThumbnail('https://i.imgur.com/6dC8HVg.png').setDescription(`\nValor do ship: **` + value.toString() + "%**\n\nMEEEU AMIGO, OS CARA SÃO FEITOS UM PRO OUTRO")
       
    message.channel.send(`${message.author}\n**Será que os dois pombinhos dariam um bom casal?**`,embed)

}};
