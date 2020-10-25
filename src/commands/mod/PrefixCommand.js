const Command = require("../../structures/command")
module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: "prefix",
            cooldown: 10,
            description: "Troque meu prefixo neste servidor",
            userPermissions: ["MANAGE_CHANNELS"],
            category: "moderação",
            usage: "<prefixo>"
        })
    }
    async run({ message, args, server }, t) {

        if (!args[0]) return message.menheraReply("error", t("commands:prefix.no-args"))
        if (args[0].length > 3) return message.menheraReply("error", t("commands:prefix.invalid-input"))

        server.prefix = args[0]
        server.save()

        message.menheraReply("success", t("commands:prefix.done", { prefix: server.prefix }))
    }
}