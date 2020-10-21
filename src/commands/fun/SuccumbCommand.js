const Command = require("../../structures/command")
module.exports = class SuccumbCommand extends Command {
    constructor(client) {
        super(client, {
            name: "sucumba",
            description: "SUCUMBA MUCALOL",
            category: "diversão",
            usage: "<menção || texto>"
        })
    }
    async run(message, args) {
        const user = message.mentions.users.first() || args.join(" ");
        if (!user) return message.reply("n/a");
        if (user.id == message.author.id) return message.reply("n/a");
        message.channel.send(`SUCUMBA **${user}**\nVERME\nLIXO\nHORROROSO\nRUIM\nHORRÍVEL\nESCÓRIA\nBOSTA\nLIXOSO\nPERITO EM ENTREGAR GAME\nCOCOZENTO`);
    }
}