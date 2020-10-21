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
    async run(message, args) {

        if (!args[0]) return message.channel.send("<:negacao:759603958317711371> | você não informou o comando desejado")
        let cmd = this.client.commands.get(args[0])
        if (!cmd) return message.channel.send("<:negacao:759603958317711371> | este comando não existe.")
        let command = await this.client.database.Cmds.findById(cmd.config.name)
        if (command.maintenance) {
            command.maintenance = false
            command.maintenanceReason = ""
            command.save().then(() => {
                message.channel.send("<:positivo:759603958485614652> | comando <:negacao:759603958317711371>**removido**<:negacao:759603958317711371> da manutenção.")
            })
        } else {
            command.maintenance = true
            command.maintenanceReason = args.slice(1).join(" ")
            command.save().then(() => {
                message.channel.send("<:positivo:759603958485614652> | comando <:positivo:759603958485614652>**adicionado**<:positivo:759603958485614652> a manutenção.")
            })
        }
    }
}