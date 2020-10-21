const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class KillCommand extends Command {
    constructor(client) {
        super(client, {
            name: "matar",
            aliases: ["kill"],
            description: "Mate aquele que você não suporta mais",
            clientPermissions: ["EMBED_LINKS"],
            category: "ações",
            usage: "<@menção>"
        })
    }
    async run(message, args) {

        var list = [
            "https://i.imgur.com/teca6na.gif",
            "https://i.imgur.com/XaqZPBf.gif",
            "https://i.imgur.com/Kj331EJ.gif",
            "https://i.imgur.com/kzW8Lpc.gif",
            "https://i.imgur.com/b9byUSu.gif",
            "https://i.imgur.com/gsFgkDh.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();
        let avatar = message.author.displayAvatarURL({ format: "png" });

        if (!user) {
            return message.channel.send("<:negacao:759603958317711371> | Se tu não matar ninguém, tu não comete crimes. STONKS");
        }

        if (user === message.author) {
            return message.channel.send("<:negacao:759603958317711371> | Ai, eu não gosto de suicídio...");
        }

        if (user.bot) {
            //links de robos
            var ro = [
                "https://i.imgur.com/tv9wQai.gif",
                "https://i.imgur.com/X9uUyEB.gif",
                "https://i.imgur.com/rtsjxWQ.gif"
            ];

            var Rrand = ro[Math.floor(Math.random() * ro.length)];

            const Rembed = new MessageEmbed()
                .setTitle("Desligar")
                .setColor("#000000")
                .setDescription(`*Robôs não podem ser mortos, mas podem ser desligados...* \n ${message.author} Desligou o bot ${user}`)
                .setImage(Rrand)
                .setThumbnail(avatar)
                .setAuthor(message.author.tag, avatar);

            return message.channel.send(Rembed);
        }

        const embed = new MessageEmbed()
            .setTitle("Matar")
            .setColor("#000000")
            .setDescription(`${message.author} M A T O U ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}