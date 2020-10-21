const Command = require("../../structures/command")
module.exports = class AfkCommand extends Command {
    constructor(client) {
        super(client, {
            name: "afk",
            cooldown: 5,
            description: "Se coloque em AFK",
            category: "util",
            usage: "[motivo]"
        })
    }
    async run(message, args) {

        let user = await this.client.database.Users.findOne({ id: message.author.id })
        if (!user) return
        let reason = args.join(" ")
        if (!reason) reason = "AFK"
        user.afk = true
        user.afkReason = reason
        user.save()

        message.channel.send("<:positivo:759603958485614652> | o modo AFK foi ativado! Para facilitar sua vida, vou desativá-lo caso mande uma mensagem!!!")
    }
}