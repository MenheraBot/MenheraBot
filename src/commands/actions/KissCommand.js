const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class KissCommand extends Command {
    constructor(client) {
        super(client, {
            name: "beijar",
            aliases: ["kiss"],
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run({ message, args, server }, t) {

        var list = [
            "https://i.imgur.com/sGVgr74.gif",
            "https://i.imgur.com/lmY5soG.gif",
            "https://i.imgur.com/e0ep0v3.gif",
            "https://i.imgur.com/P4QizDI.png",
            "https://i.imgur.com/GvS0PdU.gif",
            "https://i.imgur.com/IWBnu8V.gif",
            "https://i.imgur.com/8YkQ4py.gif",
            "https://i.imgur.com/g5la1Y0.gif",
            "https://i.imgur.com/ZD64Ly8.gif",
            'https://i.imgur.com/JOtxMGW.gif',
            "https://i.imgur.com/qlPCzMA.gif",
            "https://i.imgur.com/YbNv10F.gif",
            "https://i.imgur.com/IgGumrf.gif",
            "https://i.imgur.com/KKAMPju.gif",
            "https://i.imgur.com/eisk88U.gif",
            "https://i.imgur.com/9y34cfo.gif",
            "https://i.imgur.com/9758cJX.gif",
            "https://i.imgur.com/SS7sQpj.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];
        let user = message.mentions.users.first();

        if (user && user.bot) return message.menheraReply("error", t("commands:kiss.bot"))

        if (!user) {
            return message.menheraReply("error", t("commands:kiss.no-mention"))
        }

        if (user === message.author) {
            return message.menheraReply("error", t("commands:kiss.self-mention"))
        }

        let avatar = message.author.displayAvatarURL({ format: "png" })

        const embed = new MessageEmbed()
            .setTitle(t("commands:kiss.embed_title"))
            .setColor("#000000")
            .setDescription(`${message.author} ${t("commands:kiss.embed_description")} ${user}`)
            .setImage(rand)
            .setThumbnail(avatar)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}