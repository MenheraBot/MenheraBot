const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class PunchCommand extends Command {
    constructor(client) {
        super(client, {
            name: "socar",
            aliases: ["punch"],
            description: "Soca alguem na porrada",
            clientPermissions: ["EMBED_LINKS"],
            category: "ações",
            usage: "<@menção>"
        })
    }
    async run(message, args) {

        var list = [
            "https://i.imgur.com/f2kkp3L.gif",
            "https://i.imgur.com/C6lqbl8.gif",
            "https://i.imgur.com/pX1E9uU.gif",
            "https://i.imgur.com/GfyKm1x.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (user && user.bot) return message.channel.send(`DIGA NÃO À AGRESSÃO À ROBÔS`)

        if (!user) {
            return message.channel.send("<:negacao:759603958317711371> | Tu tem que mencionar em quem tu quer lançar aquele socão nas fuça");
        }

        if (user === message.author) {
            return message.channel.send("<:negacao:759603958317711371> | Eu não vou fazer tu se bater, mencione outra pessoa");
        }

        let avatar = message.author.displayAvatarURL({ format: "png" });

        const embed = new MessageEmbed()
            .setTitle("Toma soco leve 🤜")
            .setColor("#000000")
            .setDescription(`${message.author} socou ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}