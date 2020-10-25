const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: "invite",
            aliases: ["adicionar"],
            cooldown: 5,
            category: "util",
            clientPermissions: ["EMBED_LINKS"],
        })
    }
    async run({ message, args, server }, t) {
        const embed = new MessageEmbed()
        .setTitle(t("commands:invite.embed_title"))
        .setColor('#f763f8')
        .setURL("https://discord.com/api/oauth2/authorize?client_id=708014856711962654&permissions=1007025271&scope=bot")
        .setImage("https://i.imgur.com/ZsKuh8W.png")
        .setDescription(t("commands:invite.embed_description"))
        .setFooter(t("commands:invite.embed_footer", {user: message.author.tag}), message.author.displayAvatarURL())
        .setTimestamp()
  
      message.channel.send(embed).catch(err => console.log(err));
  
    }
}