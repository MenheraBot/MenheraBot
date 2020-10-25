const Command = require("../../structures/command")

module.exports = class DeleteCommand extends Command {
    constructor(client) {
        super(client, {
            name: "deletar",
            aliases: ["delete"],
            cooldown: 30,
            category: "util",
            clientPermissions: ["ADD_REACTIONS", "MANAGE_MESSAGES"]
        })
    }
    async run({ message, args, server }, t) {

        message.menheraReply("warn", t("commands:delete.confirm")).then(async msg => {

            msg.react("✅").catch();
            msg.react("❌").catch();

            let filter = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === message.author.id;
            let filter1 = (reação, user) => reação.emoji.name === "❌" && user.id === message.author.id;

            let ncoletor = msg.createReactionCollector(filter1, { max: 1, time: 5000 });
            let coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 });

            ncoletor.on("collect", co => {
                msg.reactions.removeAll().catch();
                message.menheraReply("success", t("commands:delete.negated"))
            });

            coletor.on("collect", cp => {
                msg.reactions.removeAll().catch();

                this.client.database.Users.findOneAndDelete({
                    id: message.author.id
                }, (err, res) => {
                    if (err) console.log(err);
                    message.menheraReply("success", t("commands:delete.acepted"))
                })
            })
            setTimeout(() => {
                msg.delete().catch();
            }, 5050);
        })
    }
}