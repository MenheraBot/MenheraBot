const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: "avatar",
            cooldown: 5,
            description: "Mostra o avatar de alguem",
            usage: "[usuário]",
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run(message, args) {


        let user = message.mentions.users.first() || this.client.users.cache.get(args[0]);

        if (!user) user = message.author;

        let cor;

        const db = await this.client.database.Users.findOne({ id: user.id })

        if (db && db.cor) {
            cor = db.cor
        } else cor = "#a788ff";

        const img = user.displayAvatarURL({ dynamic: true, size: 1024 });

        let embed = new MessageEmbed()
            .setTitle(`Avatar de ${user.username}`)
            .setImage(img)
            .setColor(cor)
            .setFooter("Que imagem linda omodeuso");

        if (user.id === this.client.user.id) {

            embed.setTitle(`Meu avatar (${user.username})`)
            embed.setColor('#f276f3')
            embed.setFooter("Eu sou muito linda né vei tem como não")

        }

        message.channel.send(message.author, embed);

    }
}