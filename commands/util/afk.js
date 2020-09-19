const database = require("../../models/user.js");

module.exports = {
  name: "afk",
  aliases: ["awayfromthekeyboard"],
  cooldown: 2,
  category: "util",
  description: "Se coloque em AFK",
  usage: "m!afk [motivo]",
  run: async (client, message, args) => {

    let user = await database.findOne({id: message.author.id})
    if(!user) return
		let reason = args.join(" ")
		if (!reason) reason = "AFK"
		user.afk = true
		user.afkReason = reason
		user.save()

		message.reply("o modo AFK foi ativado! Para facilitar sua vida, vou desativá-lo caso mande uma mensagem!!!")
}};
