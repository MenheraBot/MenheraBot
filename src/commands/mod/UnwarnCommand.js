const Command = require("../../structures/command")
module.exports = class UnwarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: "unwarn",
            userPermissions: ["KICK_MEMBERS"],
            category: "moderação",
            usage: "<usuário>"
        })
    }
    async run({ message, args, server }, t) {

        const user = message.mentions.users.first() || this.client.users.cache.get(args[0]);
        if (!user) return message.menheraReply("error", t("commands:unwarn.no-mention"))
        if (user.bot) return message.menheraReply("error", t("commands:unwarn.bot"))
        if (user.id === message.author.id) return message.menheraReply("error", t("commands:unwarn.self-mention"))
        if (!message.guild.members.cache.get(user.id)) return message.menheraReply("error", t("commands:unwarn.invalid-member"))

        this.client.database.Warns.findOneAndDelete({ userId: user.id, guildId: message.guild.id }).sort([
            ['data', 'descending']
        ]).exec((err, db) => {
            if (err) console.log(err);
            if (!db || db.length < 1) return message.menheraReply("error", `${user} ${t("commands:unwarn.no-warns")}`);
            message.menheraReply("success", t("commands:unwarn.success"))
        })
    }
}