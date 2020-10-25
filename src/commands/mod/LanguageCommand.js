const Command = require("../../structures/command")
module.exports = class LanguageCommand extends Command {
    constructor(client) {
        super(client, {
            name: "language",
            aliases: ["linguagem", "lang"],
            cooldown: 15,
            userPermissions: ["MANAGE_GUILD"],
            clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
            category: "moderação",
        })
    }
    async run({ message, args, server }, t) {

        message.menheraReply("question", t("commands:language.question")).then(msg => {
            msg.react("🇧🇷")
            setTimeout(function () {
                msg.react("🇺🇸")
            }, 500)

            const collector = msg.createReactionCollector((r, u) => (r.emoji.name === "🇧🇷", "🇺🇸") && (u.id !== this.client.user.id && u.id === message.author.id))
            collector.on("collect", r => {
                switch (r.emoji.name) {
                    case "🇧🇷":
                        server.lang = "pt-BR"
                        server.save()
                        msg.delete({ timeout: 100 })
                        message.channel.send(":map: | Agora eu irei falar em ~~brasileiro~~ português")
                        break
                    case "🇺🇸":
                        server.lang = "en-US"
                        server.save()
                        msg.delete({ timeout: 100 })
                        message.channel.send(":map: | Now I'll talk in english")
                        break
                }
            })
        })
    }
}