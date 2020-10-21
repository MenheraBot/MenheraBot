const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class SuportCommand extends Command {
    constructor(client) {
        super(client, {
            name: "suporte",
            aliases: ["support"],
            cooldown: 5,
            description: "Link de convite para o servidor de suporte do Bot",
            clientPermissions: ["EMBED_LINKS"],
            category: "util",
        })
    }
    async run(message, args) {

        const embed = new MessageEmbed()
            .setTitle("Clique aqui para entrar no servidor de suporte da Menhera")
            .setURL('https://discord.gg/fZMdQbA')
            .setColor('#970045')
            .setImage("https://i.imgur.com/ZsKuh8W.png")
            .setFooter(`Comando executado por ${message.author.tag}`, message.author.displayAvatarURL())
            .setTimestamp()
        message.channel.send(message.author, embed);

    }
}