const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");
const userDb = require("../../models/user.js")

module.exports = {
  name: "inventário",
  aliases: ["inventario", "inventory", "inv"],
  cooldown: 3,
  category: "rpg",
  description: "Veja seu inventário",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!inventário",
  run: async (client, message, args) => {

    const user = await database.findById(message.author.id)
    if(!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")

    const usuarioInDb = await userDb.findOne({id: message.author.id})

    let cor = usuarioInDb.cor || "#8f877f"
  
    let embed = new MessageEmbed()
    .setTitle("<:Chest:760957557538947133> | Seu inventário")
    .setColor(cor)

    let loots = [];
    let items = [];
    let lootText = "";
    let armaText = "";
    let itemText = "";

    if(user.loots.length > 0){
      user.loots.forEach(lot => {
        loots.push(lot.name)
      })
    }

    user.inventory.forEach(inv => {
      if(inv.type == "Item") {
          items.push(inv.name)
      }  
    })

    armaText += `🗡️ | Arma: **${user.weapon.name}**\n🩸 | Dano: **${user.weapon.damage}**\n\n`
    armaText += `🧥 | Armadura: **${user.protection.name}**\n🛡️ | Proteção: **${user.protection.armor}**\n`

    countItems(items).forEach(count => {
      itemText += `**${count.name}** (${count.amount})\n`
    })

    
    countItems(loots).forEach(count => {
      lootText += `**${count.name}** ( ${count.amount} )\n`
    })
    

    if(armaText.length > 0) embed.addField(`⚔️ | Batalha`, armaText)
    if(items.length > 0) embed.addField(`💊 | Itens`, itemText)
    if(lootText.length > 0) embed.addField(`<:Chest:760957557538947133> | Espólios de Batalha`, lootText)

    message.channel.send(message.author, embed)

}}


function countItems(arr) {
  const countMap = {};
  for (const element of arr) {
    countMap[element] = (countMap[element] || 0) + 1;
  }
  return Object.entries(countMap).map(([value, count]) => ({
    name: value,
    amount: count
  }));
}