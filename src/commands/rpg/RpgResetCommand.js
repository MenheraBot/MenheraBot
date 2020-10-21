const Command = require("../../structures/command")
module.exports = class RpgResetCommand extends Command {
    constructor(client) {
        super(client, {
            name: "reset",
            cooldown: 5,
            description: "Reseta seu perfil do RPG",
            category: "rpg"
        })
    }
    async run(message, args) {

        const user = await this.client.database.Rpg.findById(message.author.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")
        if (user.level < 7) return message.channel.send("<:negacao:759603958317711371> | Você precisa estar no nível **7** para poder resetar")

        message.channel.send("<:atencao:759603958418767922> | Você realmente deseja resetar seu perfil do RPG? Esta ação é **IRREVERSÍVEL**\nDigite `sim` para confirmar")

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        collector.on('collect', async m => {

            if (m.content.toLowerCase() == "sim") {
                if (user.hasFamily) {
                    const familia = await this.client.database.Familias.findById(user.familyName)
                    familia.members.splice(familia.members.indexOf(message.author.id.toString()), 1);
                    familia.save()
                }
                this.client.database.Rpg.findByIdAndDelete(message.author.id).then(message.channel.send("<:positivo:759603958485614652> | Você resetou com sucesso sua conta do RPG! Para jogar novamente, use m!registrar"))
            } else message.channel.send("<:negacao:759603958317711371> | Sua conta **não** foi resetada!")
        })
    }
};
