const Command = require("../../structures/command")
module.exports = class MaintenanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: "maintenance",
            aliases: ["cmd"],
            description: "Coloca ou tira um comando de manutenção",
            devsOnly: true,
            category: "Dev"
        })
    }
    async run({ message, args, server }, t) {

        if (!args[0]) return message.menheraReply("error", "você não informou o comando desejado")
        let cmd = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]))
        if (!cmd) return message.menheraReply("error", "este comando não existe")
        let command = await this.client.database.Cmds.findById(cmd.config.name)
        if (command.maintenance) {
            command.maintenance = false
            command.maintenanceReason = ""
            command.save().then(() => {
                message.menheraReply("success", "comando **REMOVIDO** da manutenção.")
            })
        } else {
            command.maintenance = true
            command.maintenanceReason = args.slice(1).join(" ")
            command.save().then(() => {
                message.menheraReply("success", "comando **ADICIONADO** a manutenção.")
            })
        }
    }
}