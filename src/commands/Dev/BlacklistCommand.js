const Command = require("../../structures/command")
module.exports = class BlackilistCommand extends Command {
    constructor(client) {
        super(client, {
            name: "blacklist",
            description: "Bane um usuário de usar a Menehra OwO",
            devsOnly: true,
            category: "Dev"
        })
    }
    async run({ message, args, server }, t) {

        if(!args[1]) return message.channel.send("Diga-me o id do usuario")

        let user = await this.client.database.Users.findOne({ id: args[1] })

        let user2 = await this.client.users.cache.get(args[1])

        switch (args[0]) {
            case "add":
                if (!user || user === null) return message.channel.send("<:negacao:759603958317711371> | usuário não encontrado, tente informar o ID da próxima vez.")
                let reason = args.slice(2).join(" ")
                if (!reason) reason = "Sem razão informada"
                user.ban = true
                user.banReason = reason;
                user.save()

                message.channel.send("<:positivo:759603958485614652> | usuário banido com sucesso.")
                break
            case "remove":
                if (!user || user === null) return message.channel.send("<:negacao:759603958317711371> | usuário não encontrado, tente informar o ID da próxima vez.")
                user.ban = false
                user.banReason = null
                user.save()

                message.reply("<:positivo:759603958485614652> | usuário desbanido com sucesso.")
                break
            case "find":
                if (!user || user === null) return message.channel.send("<:negacao:759603958317711371> | usuário não encontrado, tente informar o ID da próxima vez.")
                let msg = `== USER BANNED INFO ==\n\n• User :: ${user2.tag} - (${user2.id})\n• Banned :: ${user.ban}\n• Reason :: ${user.banReason}`
                message.channel.send(msg, {
                    code: "asciidoc"
                })
                break
            default:
                message.channel.send("<:negacao:759603958317711371> | porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`")
        }
    }
}