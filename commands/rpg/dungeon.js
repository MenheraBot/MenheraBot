const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");
const checks = require("../../handler/checks.js")

module.exports = {
  name: "dungeon",
  aliases: ["aventura"],
  cooldown: 10,
  category: "rpg",
  description: "Vá para uma aventura na dungeon",
  usage: "m!dungeon",
  run: async (client, message, args) => {

    const user = await database.findById(message.author.id)
    if(!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")

    const canGo = await checks.initialChecks(user, message)

    if(!canGo) return;

    const inimigo = await checks.getEnemy(message)

    console.log(inimigo)
  
  }};
