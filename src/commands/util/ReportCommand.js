const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class ReportCommand extends Command {
    constructor(client) {
        super(client, {
            name: "report",
            aliases: ["reportar", "bug"],
            cooldown: 5,
            description: "Mostra o ping do bot e de sua API",
            category: "util",
            usage: "<explicação do bug>",
            clientPermissions: ["EMBED_LINKS"],
        })
    }
    async run(message, args) {

        const argumentos = args.join(" ");
        var cor = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);

        if (!argumentos) return message.channel.send("<:atencao:759603958418767922> | Você não relatou o Bug!");

        const embed = new MessageEmbed()
            .setDescription(`${argumentos}`)
            .setColor(cor)
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter(`ID do usuário: ${message.author.id}`)
            .setTimestamp()
            .setAuthor(`Novo Bug Reportado por ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}));

        this.client.guilds.cache.get('717061688460967988').channels.cache.get('730906866896470097').send(embed);

        if (message.deletable) message.delete()
        message.channel.send("<:positivo:759603958485614652> | Mutissimo obrigada por reportar este bug para minha dona");
    }
}