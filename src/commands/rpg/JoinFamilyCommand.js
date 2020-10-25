const Command = require("../../structures/command")
module.exports = class JoinFamilyCommand extends Command {
    constructor(client) {
        super(client, {
            name: "família",
            aliases: ["familia", "family"],
            cooldown: 5,
            category: "rpg"
        })
    }
    async run({ message, args, server }, t) {

        const user = await this.client.database.Rpg.findById(message.author.id)
        if (!user) return message.menheraReply("error", t("commands:joinfamily.non-aventure"))

        if (user.level < 10) return message.menheraReply("error", t("commands:joinfamily.low-level"))

        if (user.hasFamily) return message.menheraReply("error", t("commands:joinfamily.has-family", {name: user.familyName}))

        const familiasDisponiveis = ["Loki", "Ares", "Freya", "Soma", "Apolo"]
        const sortedFamily = familiasDisponiveis[Math.floor(Math.random() * familiasDisponiveis.length)];

        message.menheraReply("success", t("commands:joinfamily.welcome", {family: sortedFamily}))

        const familia = await this.client.database.Familias.findById(sortedFamily)

        switch (sortedFamily) {
            case 'Freya':
                user.maxMana = user.maxMana + familia.boost.value
                break;
            case 'Soma':
                user.maxLife = user.maxLife + familia.boost.value
                break;
            case 'Apolo':
                user.abilityPower = user.abilityPower + familia.boost.value
        }
        user.hasFamily = true
        user.familyName = sortedFamily
        user.save()

        familia.members.push(message.author.id.toString())
        familia.save()
    }
}

