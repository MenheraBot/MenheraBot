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
  /* 
    new mob({
      type: "inicial",
            name: "Mini Dragão",
            life: 30,
            damage: 20,
            armor: 9,
            xp: 50,
            loots: [{name: "Escamas Frágeis", value: 17}, {name: "Dentes", value: 18}, {name: "Asa Pequena", value: 12}]
    }).save().then(console.log("novo mob"))

    message.reply("Mob adiciobnado")   */
}};
