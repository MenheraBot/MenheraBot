const Command = require("../../structures/command")
module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: "prefix",
            cooldown: 10,
            description: "Troque meu prefixo neste servidor",
            userPermissions: ["MANAGE_CHANNELS"],
            category: "moderação",
            usage: "<prefixo>"
        })
    }
    async run(message, args) {

        if (!args[0]) return message.channel.send("<:negacao:759603958317711371> | Você não disse qual será o novo prefixo do servidor")
        if (args[0].length > 3) return message.channel.send("<:negacao:759603958317711371> | Este prefixo é muito longo! Escolha um prefixo com no máximo 3 caracteres")

        const server = await this.client.database.Guilds.findOne({ id: message.guild.id })
        server.prefix = args[0]
        server.save()

        message.channel.send("<:positivo:759603958485614652> | Certo, meu prefixo neste servidor passa a ser " + server.prefix);

    }
}