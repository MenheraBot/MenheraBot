const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ProfileCommand extends Command {
    constructor(client) {
        super(client, {
            name: "perfil",
            aliases: ["profile"],
            cooldown: 5,
            description: "Veja o seu perfil, ou o de alguem",
            usage: "[usuário]",
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run(message, args) {


        /* 
        *
        *  PELO AMOR DE DEUS LUXANNA REFAZ ESSE COMANDO HORRENDO MEUS OLHOS SANGRAM
        *
        */

        let pessoa = message.mentions.users.first() || this.client.users.cache.get(args[0]);
        if (!pessoa) pessoa = message.author;

        if (pessoa.bot) return message.channel.send("Que? KKK fodase os bots, robôs não tem perfil");

        let embed = new MessageEmbed()
            .setTitle(`${pessoa.username}`)
            .setThumbnail(pessoa.displayAvatarURL({ dynamic: true }))

        this.client.database.Users.findOne({ id: pessoa.id }, (err, info) => {
            if (err) console.log(err);
            if (!info) return message.channel.send(`<:negacao:759603958317711371> | Este usuário não possui perfil!\nUtilize 'm!mamar ${pessoa}' para adicioná-lo à minha database`)
            if (info.ban) return message.channel.send(`<:negacao:759603958317711371> | Este usuário está **banido** de usar a Menhera\n**Motivo:** \`${info.banReason}\``)
            let mamadas = info.mamadas || 0;
            let mamou = info.mamou || 0;
            let nota = info.nota || `Sem Nota`;
            let cor = info.cor || '#a788ff';
            let votos = info.votos || 0;

            embed.setColor(cor)

            embed.addFields([{
                name: "👅 | Mamou",
                value: mamou,
                inline: true
            },
            {
                name: "❤️ | Mamado",
                value: mamadas,
                inline: true
            },
            {
                name: "<:God:758474639570894899> | Upvotes",
                value: votos,
                inline: true
            }
            ]);

            if (info.casado && info.casado != "false") {
                let persona = this.client.users.cache.get(info.casado) || "`Sem informações do usuário`";
                let data = info.data || "Sem data registrada";
                embed.addFields([{
                    name: "💗 | Casado com",
                    value: persona,
                    inline: true
                },
                {
                    name: "💍 | Casados em",
                    value: data,
                    inline: true
                }
                ]);
            }
            embed.addField(`<:apaixonada:727975782034440252> | Sobre Mim`, nota, true);

            message.channel.send(message.author, embed);
        })

    }
}