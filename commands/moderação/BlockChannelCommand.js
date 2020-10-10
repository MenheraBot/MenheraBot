const database = require("../../models/guild.js");

module.exports = {
    name: "bloquear",
    aliases: ["blockcmd", "block", "blockchannel"],
    cooldown: 10,
    category: "moderação",
    dir: 'BlockChannelCommand',
    description: "Bloqueie ou Desbloqueie o canal atual de usar meus comandos",
    userPermission: ["MANAGE_CHANNELS"],
    clientPermission: null,
    usage: "m!bloquear",
    run: async (client, message, args) => {

        const server = await database.findOne({
            id: message.guild.id
        })

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
};