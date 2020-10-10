const cmdDb = require("../../models/cmds.js");

module.exports = {
    name: "maintenance",
    aliases: ["cmd"],
    cooldown: 2,
    category: "Dev",
    dir: 'MaintenanceCommand',
    description: "Coloca ou tira um comando de manutenção",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!maintenance <comando>",
    devsOnly: true,

    run: async (client, message, args) => {

        if (!args[0]) return message.channel.send("<:negacao:759603958317711371> | você não informou o comando desejado")
        let cmd = client.commands.get(args[0])
        if (!cmd) return message.channel.send("<:negacao:759603958317711371> | este comando não existe.")
        let command = await cmdDb.findById(cmd.name)
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
};