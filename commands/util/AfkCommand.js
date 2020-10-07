const database = require("../../models/user.js");

module.exports = {
  name: "afk",
  aliases: [],
  cooldown: 5,
  category: "util",
  description: "Se coloque em AFK",
  userPermission: null,
  clientPermission: null,
  usage: "m!afk [motivo]",
  run: async (client, message, args) => {

    let user = await database.findOne({id: message.author.id})
    if(!user) return
		let reason = args.join(" ")
		if (!reason) reason = "AFK"
		user.afk = true
		user.afkReason = reason
		user.save()

		message.channel.send("<:positivo:759603958485614652> | o modo AFK foi ativado! Para facilitar sua vida, vou desativá-lo caso mande uma mensagem!!!")
}};
