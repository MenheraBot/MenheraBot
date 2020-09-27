const cmdDb = require("../../models/cmds.js");

module.exports = {
  name: "maintenance",
  aliases: ["disable", "cmd"],
  cooldown: 2,
  category: "Dev",
  description: "Coloca ou tira um comando de manutenção",
  usage: "m!maintenance <comando>",
  devsOnly: true,

  run: async (client, message, args) => {

    if (!args[0]) return message.channel.send("❌ | você não informou o comando desejado")
    let cmd = client.commands.get(args[0])
    if (!cmd) return message.channel.send("❌ | este comando não existe.")
    let command = await cmdDb.findById(cmd.name)
    if (command.maintenance) {
        command.maintenance = false
        command.maintenanceReason = ""
        command.save().then(() => {
            message.channel.send("✅ | comando ❌**removido**❌ da manutenção.")
        })
    } else {
        command.maintenance = true
        command.maintenanceReason = args.slice(1).join(" ")
        command.save().then(() => {
            message.channel.send("✅ | comando ✅**adicionado**✅ a manutenção.")
        })
    }
}};
