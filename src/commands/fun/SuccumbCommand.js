const Command = require("../../structures/command")
module.exports = class SuccumbCommand extends Command {
    constructor(client) {
        super(client, {
            name: "sucumba",
            category: "diversão"
        })
    }
    async run({ message, args, server }, t) {
        const user = message.mentions.users.first() || args.join(" ");
        if (!user) return message.menheraReply("error", "n/a")
        if (user.id == message.author.id) return message.menheraReply("error", "n/a")
        message.channel.send(`${t("commands:sucumba.start")} **${user}** ${t("commands:sucumba.end")}`);
    }
}