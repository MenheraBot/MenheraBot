const Command = require("../../structures/command")

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: "roll",
            cooldown: 5,
            category: "util"
        })
    }
    async run({ message, args, server }, t) {

        let user = await this.client.database.Users.findOne({ id: message.author.id });

        if (!user || user === null) {
            new this.client.database.Users({
                id: message.author.id,
                nome: message.author.username
            }).save()
        }

        if (parseInt(user.caçarTime) < Date.now()) return message.menheraReply("error", t("commands:roll.can-hunt"))

        if (user.rolls < 1) return message.menheraReply("error", t("commands:roll.poor"))

        user.rolls = user.rolls - 1;
        user.caçarTime = "000000000000"
        user.save()
        message.menheraReply("success", t("commands:roll.success"))
    }
}