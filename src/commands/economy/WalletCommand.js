const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class WalletCommand extends Command {
    constructor(client) {
        super(client, {
            name: "carteira",
            aliases: ["wallet"],
            description: "Veja a carteira de alguém",
            usage: "[usuário]",
            category: "economia",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run(message, args) {

        let pessoa = message.mentions.users.first() || this.client.users.cache.get(args[0]);
        if (!pessoa) pessoa = message.author;

        let user = await this.client.database.Users.findOne({ id: pessoa.id });
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Este usuário não está em minha database")

        let cor;

        if (user.cor) {
            cor = user.cor
        } else cor = "#a788ff";

        const embed = new MessageEmbed()
            .setTitle(`Carteira de ${pessoa.tag}`)
            .setColor(cor)
            .addFields([{
                name: "⭐ | Estrelinhas",
                value: `**${user.estrelinhas}**`,
                inline: true
            },
            {
                name: "🔑 | Rolls",
                value: `**${user.rolls}**`,
                inline: true
            },
            {
                name: "<:DEMON:758765044443381780> | Demônios ",
                value: `**${user.caçados}**`,
                inline: true
            },
            {
                name: "<:ANGEL:758765044204437535> | Anjos",
                value: `**${user.anjos}**`,
                inline: true
            },
            {
                name: "<:SemiGod:758766732235374674> | Semideuses",
                value: `**${user.semideuses}**`,
                inline: true
            },
            {
                name: "<:God:758474639570894899> | Deuses",
                value: `**${user.deuses}**`,
                inline: true
            }
            ])

        message.channel.send(message.author, embed)
    }
}