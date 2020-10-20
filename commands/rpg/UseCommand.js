const {
  MessageEmbed
} = require("discord.js");
const database = require("../../models/rpg.js");

module.exports = {
  name: "usar",
  aliases: ["use", "usa"],
  cooldown: 3,
  category: "rpg",
  dir: 'UseCommand',
  description: "Use um item de seu inventário",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!usar [item] [quantidade] ",
  run: async (client, message, args) => {

    const user = await database.findById(message.author.id)
    if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro")

    if (user.inBattle) return message.channel.send("<:negacao:759603958317711371> | Você não pode usar poções no meio de uma batalha!")

    let embed = new MessageEmbed()
      .setTitle("💊 | Poções")
      .setColor('#ae98d8')
      .setDescription(`Use m!usar [opção] [quantidade] para usar uma poção\n\nSeus Status:\n🩸 | Vida: **${user.life}/${user.maxLife}**\n💧 | Mana: **${user.mana}/${user.maxMana}**`)

    let itemText = "";
    let items = [];

    let number = 0;
    let option = []

    user.inventory.forEach(inv => {
      if (inv.type == "Item") {
        items.push(inv.name)
      }
    })

    let juntos = countItems(items);

    juntos.forEach(count => {
      number++;
      option.push(number.toString())
      itemText += `------------**[ ${number} ]**------------\n**${count.name}** ( ${count.amount} )\n`
    })

    if (items.length > 0) {
      embed.addField(`💊 | Itens`, itemText)
    } else {
      embed.setDescription("**Você não possui poções! Compre poções na Casa da Velha Feiticeira na Vila**")
      embed.setColor("#e53910")
    }

    if (!args[0]) return message.channel.send(message.author, embed)

    if (!option.includes(args[0])) return message.channel.send("<:negacao:759603958317711371> | Esta opção não é válida!")

    let choice = user.inventory.filter(f => f.name == user.inventory[user.inventory.findIndex(function (i) {
      return i.name === juntos[args[0] - 1].name
    })].name)

    let input = args[1]
    let quantidade;

    if(!input){
       quantidade = 1
    } else quantidade = input.replace(/\D+/g, '');


    if(quantidade < 1) return message.channel.send("<:negacao:759603958317711371> | Essa quantidade é inválida")

    if(quantidade > juntos[args[0] - 1].amount) return message.channel.send("<:negacao:759603958317711371> | Esta quantidade é maior da que você tem!")

    if (choice[0].description.indexOf("mana") > -1) {
      if (user.mana == user.maxMana) return message.channel.send("<:negacao:759603958317711371> | Sua mana já está cheia!")
      user.mana = user.mana + ( choice[0].damage * quantidade)
      if (user.mana > user.maxMana) user.mana = user.maxMana
    } else if (choice[0].description.indexOf("vida") > -1) {
      if (user.life == user.maxLife) return message.channel.send("<:negacao:759603958317711371> | Sua vida já está cheia!")
      user.life = user.life + ( choice[0].damage * quantidade)
      if (user.life > user.maxLife) user.life = user.maxLife
    } else return message.channel.send("<:negacao:759603958317711371> | nheee, ocorreu um erro ao usar a poção! Chame minha dona em meu servidor de suporte para ver isso")

    for(i = 0; i < quantidade; i++){
    user.inventory.splice(user.inventory.findIndex(function (i) {
      return i.name === juntos[args[0] - 1].name
    }), 1);
  }
    user.save()

    message.channel.send(`<:positivo:759603958485614652> | Prontinho ${message.author}! Você usou \`${quantidade}\` **${choice[0].name}**`)

  }
};


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