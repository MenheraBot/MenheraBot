const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class GrumbleCommand extends Command {
    constructor(client) {
        super(client, {
            name: "resmungar",
            aliases: ["grumble", "humpf"],
            description: "Resmungue humpf",
            clientPermissions: ["EMBED_LINKS"],
            category: "ações"
        })
    }
    async run(message, args) {

        let avatar = message.author.displayAvatarURL({format: "png"});

        var list = [
            "https://i.imgur.com/l1jwHGy.gif",
            "https://i.imgur.com/4co1K8h.gif",
            "https://i.imgur.com/XAcuQN9.gif",
            "https://i.imgur.com/JeolGmS.gif",
            "https://i.imgur.com/lGUJNbY.gif",
            "https://i.imgur.com/V9XR3VN.gif"
        ];

        var rand = list[Math.floor(Math.random() * list.length)];

        const embed = new MessageEmbed()
            .setTitle("Humpf")
            .setColor("#000000")
            .setDescription(`${message.author} está resmungando`)
            .setThumbnail(avatar)
            .setImage(rand)
            .setAuthor(message.author.tag, avatar);

        message.channel.send(embed);
    }
}