const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class PatCommand extends Command {
    constructor(client) {
        super(client, {
            name: "carinho",
            aliases: ["pat"],
            description: "Faça carinho em alguem",
            clientPermissions: ["EMBED_LINKS"],
            category: "ações",
            usage: "<@menção>"
        })
    }
    async run(message, args) {

        var list = [
            "https://i.imgur.com/UWbKpx8.gif",
            "https://i.imgur.com/4ssddEQ.gif",
            "https://i.imgur.com/LUypjw3.gif",
            "https://i.imgur.com/2lacG7l.gif",
            "https://i.imgur.com/2k0MFIr.gif",
            "https://i.imgur.com/XjsEMiK.gif",
            "https://i.imgur.com/sLwoifL.gif",
            "https://i.imgur.com/TPqMPka.gif",
            "https://i.imgur.com/9CvzZTE.gif",
            "https://i.imgur.com/RsPHpae.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (!user) {
            return message.channel.send("<:negacao:759603958317711371> | Tu tem que mencionar em quem tu quer fazer carinho");
        }

        if (user === message.author) {
            return message.reply("<:negacao:759603958317711371> | Se tu quiser tu pode fazer carinho em si mesmo agora. Utilize meu comando somente para fazer carinho em outras pessoas");
        }

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle("Carinho")
            .setColor("#000000")
            .setDescription(`${message.author} fez carinho em ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}