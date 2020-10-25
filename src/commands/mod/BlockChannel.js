const Command = require("../../structures/command")
module.exports = class BlockChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: "bloquear",
            aliases: ["blockcmd", "block", "blockchannel"],
            cooldown: 10,
            userPermissions: ["MANAGE_CHANNELS"],
            category: "moderação"
        })
    }
    async run({ message, args, server }, t) {

        if (server.blockedChannels.includes(message.channel.id)) {
            const index = server.blockedChannels.indexOf(message.channel.id);
            if (index > -1) {
                server.blockedChannels.splice(index, 1);
                message.menheraReply("success", t("commands:blockchannel.unblock"))
            }
        } else {
            server.blockedChannels.push(message.channel.id)
            message.menheraReply("success", t("commands:blockchannel.block", { prefix: server.prefix }))
        }

        server.save()
    }
}