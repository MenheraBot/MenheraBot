const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ProfileCommand extends Command {
    constructor(client) {
        super(client, {
            name: "perfil",
            aliases: ["profile"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run({ message, args, server }, t) {

        let pessoa
        if (args[0]) {
            try{
            pessoa = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ""))
            } catch {
                return message.menheraReply("error", t("commands:profile.unknow-user"))
            }
		} else {
			pessoa = message.author
        }

        if (pessoa.bot) return message.menheraReply("error", t("commands:profile.bot"))

        let embed = new MessageEmbed()
            .setTitle(`${pessoa.username}`)
            .setThumbnail(pessoa.displayAvatarURL({ dynamic: true }))

        const user = await this.client.database.Users.findOne({ id: pessoa.id })

        if (!user) return message.menheraReply("error", t("commands:profile.no-dbuser"))
        if (user.ban) return message.menheraReply("error", t("commands:profile.banned", { reason: user.banReason }))
        let mamadas = user.mamadas || 0;
        let mamou = user.mamou || 0;
        let nota = user.nota || `Sem Nota`;
        let cor = user.cor || '#a788ff';
        let votos = user.votos || 0;

        embed.setColor(cor)

        embed.addFields([{
            name: `👅 | ${t("commands:profile.mamou")}`,
            value: mamou,
            inline: true
        },
        {
            name: `❤️ | ${t("commands:profile.mamado")}`,
            value: mamadas,
            inline: true
        },
        {
            name: "<:God:758474639570894899> | Upvotes",
            value: votos,
            inline: true
        }
        ]);

        if (user.casado && user.casado != "false") {
            let persona = this.client.users.cache.get(user.casado) || "`Sem informações do usuário`";
            let data = user.data || "Sem data registrada";
            embed.addFields([{
                name: `💗 | ${t("commands:profile.married-with")}`,
                value: persona,
                inline: true
            },
            {
                name: `💍 | ${t("commands:profile.married-in")}`,
                value: data,
                inline: true
            }
            ]);
        }
        embed.addField(`<:apaixonada:727975782034440252> | ${t("commands:profile.about-me")}`, nota, true);

        message.channel.send(message.author, embed);
    }
}