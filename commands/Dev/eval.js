const Discord = require("discord.js");

const database = require("../../models/user.js");
const Warns = require("../../models/warn.js");

module.exports = {
  name: "eval",
  aliases: ["run", "execute"],
  cooldown: 2,
  category: "Dev",
  description: "Executa algo",
  usage: "m!eval <comando>",
  devsOnly: true,

  run: async (client, message, args) => {
  try {
    const util = require("util")
    let evaled = await eval(args.join(" "))
    evaled = util.inspect(evaled, { depth: 1 })
    evaled = evaled.replace(new RegExp(`${client.token}`, "g"), undefined)

    if (evaled.length > 1800) evaled = `${evaled.slice(0, 1800)}...`
    message.channel.send(evaled, { code: "js" })
  } catch (err) {
    const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack
    const embed = new Discord.MessageEmbed()
    embed.setColor('#ff0000')
    embed.setTitle(`<:negacao:759603958317711371> | Erro`)
    embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``)

    message.channel.send(embed)
  }


}};
