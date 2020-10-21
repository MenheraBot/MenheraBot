const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const moment = require("moment")
require("moment-duration-format")
module.exports = class BotinfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "botinfo",
            aliases: ["menhera"],
            cooldown: 10,
            description: "Mostra as informações atuais do bot",
            category: "util",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run(message, args) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])

        const embed = new MessageEmbed()
            .setColor('#fa8dd7')
            .setThumbnail("https://i.imgur.com/b5y0nd4.png")
            .setDescription(`Oi, meu nome é **${this.client.user.username}**, e eu sou uma Bot Brasileira para Discord com foco em diversão e RPG!\n\nEu sou feita em JavaScript com discord.js! Fui criada em **${moment.utc(this.client.user.createdAt).format("LLLL")}** e entrei nesse servidor **${moment.utc(message.guild.me.joinedAt).format("LLLL")}**`)
            .setFooter(`${this.client.user.username} foi criada por ${owner.tag}`, owner.displayAvatarURL({
                format: "png",
                dynamic: true
            }))
            .addFields([{
                name: "🌐 | Servers",
                value: `${this.client.guilds.cache.size} `,
                inline: true
            },
            {
                name: "🗄️ | Canais",
                value: this.client.channels.cache.size,
                inline: true
            },
            {
                name: "📊 | Usuários",
                value: this.client.users.cache.size,
                inline: true
            },
            {
                name: "⏳ | Uptime",
                value: moment.duration(this.client.uptime).format("D[d], H[h], m[m], s[s]"),
                inline: true
            },
            {
                name: "<:memoryram:762817135394553876> | Memória",
                value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
                inline: true
            },
            {
                name: "🇧🇷 | Versão",
                value: require("../../../package.json").version,
                inline: true
            }
            ])
        message.channel.send(embed)
    }
}