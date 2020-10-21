const Command = require("../../structures/command")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            cooldown: 5,
            description: "Faça-me dizer algo",
            userPermissions: ["MANAGE_MESSAGES"],
            clientPermissions: ["MANAGE_MESSAGES"],
            category: "util",
            usage: "<texto>"
        })
    }
    async run(message, args) {

        const sayMessage = args.join(" ");
        if (!sayMessage) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você deve digitar o texto que quer que eu fale`)
        message.delete().catch()
         message.channel.send(sayMessage);
        
    }
}