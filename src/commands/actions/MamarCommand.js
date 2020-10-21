const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class MamarCommand extends Command {
    constructor(client) {
        super(client, {
            name: "mamar",
            aliases: ["suck", "sugada"],
            description: "Da aquela mamada de qualidade monstra",
            clientPermissions: ["EMBED_LINKS"],
            category: "ações",
            usage: "<@menção>"
        })
    }
    async run(message, args) {

        const mention = message.mentions.users.first();

        if (!mention) return message.channel.send("<:negacao:759603958317711371> | KKK ala o autista mamando o nada");

        if (mention.bot) {
            message.channel.send(`${message.author} acabou de sujar a boca de óleo mamano o bot ${mention}`);
            return;
        }

        if (mention == message.author) return message.channel.send("<:negacao:759603958317711371> | Não tenta me enganar, eu sei que tu não consegue mamar a si mesmo! Marque outra pessoa para mamar");

        let user1 = await this.client.database.Users.findOne({ id: mention.id })
        let user2 = await this.client.database.Users.findOne({ id: message.author.id })

        if (!user1) {
            user1 = new this.client.database.Users({ id: mention.id })
        }

        user1.mamadas = user1.mamadas + 1
        user2.mamou = user2.mamou + 1


        var list = [
            "https://i.imgur.com/PlAtqkk.gif",
            "https://i.imgur.com/LjuLhYq.gif",
            "https://i.imgur.com/zvZ2AiM.gif",
            "https://i.imgur.com/xRBDmXD.gif",
            "https://i.imgur.com/JF5FaNC.gif",
            "https://i.imgur.com/ZAx2dOC.gif",
            "https://i.imgur.com/t1aaEMY.gif",
            "https://i.imgur.com/GEB31Fi.gif",
            "https://i.imgur.com/OMzXpXR.gif",
            "https://i.imgur.com/9DYjWtP.gif",
            "https://i.imgur.com/5Tjpori.gif",
            "https://i.imgur.com/vejOIZc.gif",
            "https://i.imgur.com/qyjOnix.gif",
            "https://i.imgur.com/J3K2d9A.gif",
            "https://i.imgur.com/JgXWxWf.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let avatar = message.author.displayAvatarURL({ format: "png" });
        const embed = new MessageEmbed()
            .setTitle("Mamar")
            .setColor("#000000")
            .setDescription(`${message.author} Mamou ${mention}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);

        user1.save()
        user2.save()

    }
}