const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: "vote",
            aliases: ["votar", "upvote"],
            cooldown: 5,
            description: "Vote no bot (pfv vote, isso ajuda muito X3 >.< ",
            category: "util",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run({ message, args, server }, t) {

        const embed = new MessageEmbed()
        .setTitle(t("commands:vote.embed_title"))
        .setColor('#f763f8')
        .setURL("https://top.gg/bot/708014856711962654/vote")
        .setImage("https://i.imgur.com/27GxqX1.jpg")
        .setDescription(t("commands:vote.embed_description"))
        .setFooter(`${t("commands:vote.embed_footer")} ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp()
  
      message.channel.send(embed);
    }
}