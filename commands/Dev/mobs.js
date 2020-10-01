const mob = require("../../models/mobs.js")
module.exports = {
  name: "mobs",
  aliases: ["mob"],
  cooldown: 2,
  category: "Dev",
  description: "Adiciona um bot à database",
  usage: "m!mob <mob>",
  devsOnly: true,

  run: async (client, message, args) => {
  
    /* new mob({
      type: "medio",
            name: "Bruxa enverrugada",
            life: 30,
            damage: 38,
            armor: 15,
            xp: 22,
            loots: [{name: "Verruga fedida", value: 11}, {name: "Cajado velho", value: 18}, {name: "Chapéu da bruxa", value: 15}, {name: "Frasco de Poção vazio", value: 5}]
    }).save().then(console.log("novo mob"))

    message.reply("Mob adiciobnado")   */
}};
