const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const moment = require("moment")
require("moment-duration-format")
const version = require("../../../package.json").version
module.exports = class BotinfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "botinfo",
            aliases: ["menhera"],
            cooldown: 10,
            category: "util",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run({ message, args, server }, t) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])
        if(server.lang == "pt-BR"){
            moment.locale("pt-br")
        } else moment.locale("en-us")

        const embed = new MessageEmbed()
            .setColor('#fa8dd7')
            .setThumbnail("https://i.imgur.com/b5y0nd4.png")
            .setDescription(t("commands:botinfo.embed_description", {name: this.client.user.username, createdAt: moment.utc(this.client.user.createdAt).format("LLLL"), joinedAt: moment.utc(message.guild.me.joinedAt).format("LLLL")}))
            .setFooter(`${this.client.user.username} ${t("commands:botinfo.embed_footer")} ${owner.tag}`, owner.displayAvatarURL({
                format: "png",
                dynamic: true
            }))
            .addFields([{
                name: "🌐 | Servers | 🌐",
                value: `\`\`\`${this.client.guilds.cache.size}\`\`\``,
                inline: true
            },
            {
                name: `🗄️ | ${t("commands:botinfo.channels")} | 🗄️`,
                value: `\`\`\`${this.client.channels.cache.size}\`\`\``,
                inline: true
            },
            {
                name: "⏳ | Uptime | ⏳",
                value: `\`\`\`${moment.duration(this.client.uptime).format("D[d], H[h], m[m], s[s]")}\`\`\``,
                inline: true
            },
            {
                name: `<:memoryram:762817135394553876> | ${t("commands:botinfo.memory")} | <:memoryram:762817135394553876>`,
                value: `\`\`\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\`\`\``,
                inline: true
            },
            {
                name: `🇧🇷 | ${t("commands:botinfo.version")} | 🇧🇷`,
                value: `\`\`\`${version}\`\`\``,
                inline: true
            }
            ])
        message.channel.send(embed)
    }
}