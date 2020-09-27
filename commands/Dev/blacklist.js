const database = require("../../models/user.js");

module.exports = {
    name: "blacklist",
    aliases: ["ban", "menheraban", "banmenhera", "mb"],
    cooldown: 2,
    category: "Dev",
    description: "Bane um usuário de usar a menhera",
	usage: "m!blacklist <add|remove|viwe><user>",
	devsOnly: true,
    run: async (client, message, args) => {

        let user = await database.findOne({id: args[1]})
		let user2 = await client.users.fetch(args[1])
		switch (args[0]) {
			case "add":
                if (!user || user === null) return message.channel.send("❌ | usuário não encontrado, tente informar o ID da próxima vez.")
                let reason = args.slice(2).join(" ")
                if(!reason) reason = "Sem razão informada"
				user.ban = true
                user.banReason = reason;
				user.save()

				message.channel.send("✅ | usuário banido com sucesso.")
				break
			case "remove":
				if (!user || user === null) return message.channel.send("❌ | usuário não encontrado, tente informar o ID da próxima vez.")
				user.ban = false
				user.banReason = null
				user.save()

				message.reply("✅ | usuário desbanido com sucesso.")
				break
			case "find":
				if (!user || user === null) return message.channel.send("❌ | usuário não encontrado, tente informar o ID da próxima vez.")
				let msg = `== USER BANNED INFO ==\n\n• User :: ${user2.tag} - (${user2.id})\n• Banned :: ${user.ban}\n• Reason :: ${user.banReason}`
				message.channel.send(msg, { code: "asciidoc" })
				break
			default:
				message.channel.send("❌ | porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`")
		}
    }}