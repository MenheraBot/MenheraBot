const Command = require("../../structures/command")
module.exports = class AfkCommand extends Command {
    constructor(client) {
        super(client, {
            name: "afk",
            cooldown: 5,
            category: "util"
        })
    }
    async run({ message, args, server }, t) {

        let user = await this.client.database.Users.findOne({ id: message.author.id })
        if (!user) return
        let reason = args.join(" ")
        if (!reason) reason = "AFK"
        user.afk = true
        user.afkReason = reason
        user.save()

        message.menheraReply("success", t("commands:afk.success"))
    }
}