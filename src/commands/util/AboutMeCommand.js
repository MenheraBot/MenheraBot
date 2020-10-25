const Command = require("../../structures/command")
module.exports = class AboutMeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "sobremim",
            aliases: ["aboutme"],
            cooldown: 10,
            category: "util"
        })
    }
    async run({ message, args, server }, t) {

        const nota = args.join(" ");
        if (!nota) return message.menheraReply("error", t("commands:aboutme.no-args"))
        if (nota.length > 200) return message.menheraReply("error", t("commands:aboutme.args-limit"))

        this.client.database.Users.findOne({ id: message.author.id }, (err, res) => {
            if (err) console.log(err)
            res.nota = nota;
            res.save()
        })

        message.menheraReply("success", t("commands:aboutme.success"))
    }
}