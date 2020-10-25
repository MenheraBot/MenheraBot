const Command = require("../../structures/command")
module.exports = class CoinflipCommand extends Command {
    constructor(client) {
        super(client, {
            name: "coinflip",
            aliases: ["cf"],
            cooldown: 5,
            category: "economia"
        })
    }
    async run({ message, args, server }, t) {

        const user1 = message.author
        const user2 = message.mentions.users.first()
        const input = args[1]
        if (!input) return message.menheraReply("error", t("commands:coinflip.invalid-value"))
        const valor = input.replace(/\D+/g, '');

        if (!user2) return message.menheraReply("error", t("commands:coinflip.no-mention"))
        if (user2.bot) return message.menheraReply("error", t("commands:coinflip.bot"))
        if (user2.id === user1.id) return message.menheraReply("error", t("commands:coinflip.self-mention"))

        if (isNaN(parseInt(valor))) return message.menheraReply("error", t("commands:coinflip.invalid-value"))
        if (parseInt(valor) < 1) return message.menheraReply("error", t("commands:coinflip.invalid-value"))

        const db1 = await this.client.database.Users.findOne({ id: user1.id })
        const db2 = await this.client.database.Users.findOne({ id: user2.id })

        if (!db1 || !db2) return message.menheraReply("error", t("commands:coinflip.no-dbuser"))

        if (valor > db1.estrelinhas) return message.menheraReply("error", t("commands:coinflip.poor"))
        if (valor > db2.estrelinhas) return message.channel.send(`<:negacao:759603958317711371> **|** ${user2} ${t("commands:coinflip.poor")}`)

        message.channel.send(`${user2}, ${user1} ${t("commands:coinflip.confirm", {value: valor, user1: user1.username, user2: user2.username})}`).then(msg => {

            msg.react('✅');
            let filter = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === user2.id;

            let coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 })

            coletor.on("collect", r => {
                const shirleyTeresinha = ["Cara", "Coroa"]
                const choice = shirleyTeresinha[Math.floor(Math.random() * shirleyTeresinha.length)]

                switch (choice) {
                    case 'Cara':
                        message.channel.send(t("commands:coinflip.cara", {value: valor, user1: user1.username, user2: user2.username}))
                        db1.estrelinhas = db1.estrelinhas + parseInt(valor)
                        db2.estrelinhas = db2.estrelinhas - parseInt(valor)
                        db1.save()
                        db2.save()
                        break
                    case 'Coroa':
                        message.channel.send(t("commands:coinflip.coroa", {value: valor, user1: user1.username, user2: user2.username}))
                        db1.estrelinhas = db1.estrelinhas - parseInt(valor)
                        db2.estrelinhas = db2.estrelinhas + parseInt(valor)
                        db1.save()
                        db2.save()
                        break
                }
            })
        })
    }
}