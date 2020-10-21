const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class BicudaCommand extends Command {
    constructor(client) {
        super(client, {
            name: "bicuda",
            aliases: ["chutar"],
            description: "Da uma bicuda em alguem",
            clientPermissions: ["EMBED_LINKS"],
            category: "ações",
            usage: "<@menção>"
        })
    }
    async run(message, args) {

        var list = [
            "https://i.imgur.com/GoHtaA8.gif",
            "https://i.imgur.com/krh4BD6.gif",
            "https://i.imgur.com/ilRr5yw.gif",
            "https://i.imgur.com/UtWFnw1.gif",
            "https://i.imgur.com/17g1pkj.gif",
            "https://i.imgur.com/WjU3lxi.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (user && user.bot) return message.channel.send(`${message.author} chutou um robô, se pa que quebrou a perna. Só se pa... assim...`);

        if (!user) {
            return message.channel.send("<:negacao:759603958317711371> | Eae avatar, vai parar de chutar o ar? Menciona quem quer chutar.");
        }

        if (user === message.author) {
            return message.channel.send("<:negacao:759603958317711371> | ???? isso nem é possível cara, n tem como se autochutar. Mencione outro usuário por favor");
        }

        let avatar = message.author.displayAvatarURL({format: "png"});

        const embed = new MessageEmbed()
            .setTitle("Bicuda")
            .setColor("#000000")
            .setDescription(`${message.author} meteu o bicudão em ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}