const Discord = require("discord.js");

const database = require("../../models/user.js");
const Warns = require("../../models/warn.js");

module.exports = {
    name: "blacklist",
    aliases: ["ban", "menheraban", "banmenhera"],
    cooldown: 2,
    category: "Dev",
    description: "Bane um usuário de usar a menhera",
    usage: "m!blacklist <add|remove|viwe><user>",
    run: async (client, message, args) => {
        if(message.author.id !== '435228312214962204') return message.channel.send("Este comando é exclusivo da minha Dona");

        let user = await database.findOne({id: args[1]})
		let user2 = await client.users.fetch(args[1])
		switch (args[0]) {
			case "add":
				if (!user || user === null) return message.reply("usuário não encontrado, tente informar o ID da próxima vez.")
				user.ban = true
				user.banReason = args.slice(2).join(" ")
				user.save()

				message.reply("usuário banido com sucesso.")
				break
			case "remove":
				if (!user || user === null) return message.reply("usuário não encontrado, tente informar o ID da próxima vez.")
				user.ban = false
				user.banReason = null
				user.save()

				message.reply("usuário desbanido com sucesso.")
				break
			case "view":
				if (!user || user === null) return message.reply("usuário não encontrado, tente informar o ID da próxima vez.")
				let msg = `== USER BANNED INFO ==\n\n• User :: ${user2.tag} - (${user2.id})\n• Banned :: ${user.ban}\n• Reason :: ${user.banReason}`
				message.channel.send(msg, { code: "asciidoc" })
				break
			default:
				message.reply("porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `view`")
		}
    }}