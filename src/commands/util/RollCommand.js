const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: "roll",
            cooldown: 5,
            description: "Use um DR para resetar seu tempo de caçadas",
            category: "util"
        })
    }
    async run(message, args) {

        let user = await this.client.database.Users.findOne({id: message.author.id});

        if (!user || user === null) {
            new this.client.database.Users({
                id: message.author.id,
                nome: message.author.username
            }).save()
        }

        if (parseInt(user.caçarTime) < Date.now()) return message.channel.send(`<:negacao:759603958317711371> | Ei ${message.author}, você já pode caçar! Caçe antes de usar um Roll!`);

        if (user.rolls < 1) return message.channel.send(`<:negacao:759603958317711371> | Você não possui DailyRolls! Vote em mim para resgatar um DR`);

        user.rolls = user.rolls - 1;
        user.caçarTime = "000000000000"
        user.save()
        message.channel.send(`<:positivo:759603958485614652> | Prontinho, você resetou seu tempo de caçadas, pode caçar!`)

    }
}