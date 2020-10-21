const Command = require("../../structures/command")
module.exports = class AboutMeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "sobremim",
            aliases: ["aboutme"],
            cooldown: 10,
            description: "Mude seu Sobre Mim",
            category: "util",
            usage: "<texto>"
        })
    }
    async run(message, args) {

        const nota = args.join(" ");
        if (!nota) return message.channel.send("<:negacao:759603958317711371> | Você não me disse o que queres colocar em seu 'Sobre Mim'");
        if (nota.length > 200) return message.channel.send("<:negacao:759603958317711371> | Seu sobremim não pode ser maior que 200 caracteres")

        this.client.database.Users.findOne({ id: message.author.id }, (err, res) => {
            if (err) console.log(err)
            res.nota = nota;
            res.save()
        })

        message.channel.send("<:positivo:759603958485614652> | Seu 'Sobre Mim' foi alterado com sucesso! Use m!perfil >.<")
    }
}