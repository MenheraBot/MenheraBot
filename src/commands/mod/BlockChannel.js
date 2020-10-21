const Command = require("../../structures/command")
module.exports = class BlockChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: "bloquear",
            aliases: ["blockcmd", "block", "blockchannel"],
            cooldown: 10,
            description: "Bloqueie ou Desbloqueie o canal atual de usar meus comandos",
            userPermissions: ["MANAGE_CHANNELS"],
            category: "moderação"
        })
    }
    async run(message, args) {

        const server = await this.client.database.Guilds.findOne({ id: message.guild.id })

        if (server.blockedChannels.includes(message.channel.id)) {
            const index = server.blockedChannels.indexOf(message.channel.id);
            if (index > -1) {
                server.blockedChannels.splice(index, 1);
                message.channel.send("<:positivo:759603958485614652> | Meus comandos foram **Liberados** neste canal!")
            }
        } else {
            server.blockedChannels.push(message.channel.id)
            message.channel.send(`<:positivo:759603958485614652> | Meus comandos foram **Bloqueados** neste canal! Use ${server.prefix}bloquear para desbloqueá-los`)
        }

        server.save()
    }
}