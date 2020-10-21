const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: "votar",
            aliases: ["vote", "upvote"],
            cooldown: 5,
            description: "Vote no bot (pfv vote, isso ajuda muito X3 >.< ",
            category: "util",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run(message, args) {

        const embed = new MessageEmbed()
        .setTitle("Clique para votar em mim")
        .setColor('#f763f8')
        .setURL("https://top.gg/bot/708014856711962654/vote")
        .setImage("https://i.imgur.com/27GxqX1.jpg")
        .setDescription("Votos ajudam na divulgação do bot, e isso é extremamente importante")
        .setFooter(`Comando executado por ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp()
  
      message.channel.send(embed);
    }
}