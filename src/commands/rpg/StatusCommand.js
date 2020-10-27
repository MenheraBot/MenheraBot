const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class StatusCommand extends Command {
    constructor(client) {
        super(client, {
            name: "status",
            aliases: ["stats"],
            cooldown: 5,
            category: "rpg",
            clientPermissions: ["EMBED_LINKS"]
        })
    }
    async run({ message, args, server }, t) {

        let mentioned;
        if (args[0]) {
            try {
                mentioned = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ""))
            } catch {
                return message.menheraReply("error", t("commands:status.not-found"))
            }
        } else mentioned = message.author


        const user = await this.client.database.Rpg.findById(mentioned.id)
        if (!user) return message.menheraReply("error", t("commands:status.not-found"))

        let dmg = `${user.damage} + ${user.weapon.damage}`
        let ptr = `${user.armor} + ${user.protection.armor}`

        let familia

        if (user.hasFamily) {
            familia = await this.client.database.Familias.findById(user.familyName)
            if (user.familyName === "Loki ") dmg = `${user.damage} + ${user.weapon.damage} + \`${familia.boost.value}\``
            if (user.familyName === "Ares") ptr = `${user.armor} + ${user.protection.armor} + ${familia.boost.value}`
        }

        let embed = new MessageEmbed()
            .setTitle(`📜 | ${t("commands:status.title", { name: mentioned.username })}`)
            .setColor('#f04682')
            .addFields([{
                name: `🩸 | ${t("commands:status.life")}`,
                value: user.life + '/' + user.maxLife,
                inline: true
            },
            {
                name: `⚔️ | ${t("commands:status.class")}`,
                value: user.class,
                inline: true
            },
            {
                name: `🛡️ | ${t("commands:status.armor")}`,
                value: ptr,
                inline: true
            },
            {
                name: `🗡️ | ${t("commands:status.dmg")}`,
                value: dmg,
                inline: true
            }, {
                name: `💧 | ${t("commands:status.mana")}`,
                value: user.mana + '/' + user.maxMana,
                inline: true
            },
            {
                name: `🔮 | ${t("commands:status.ap")}`,
                value: user.abilityPower,
                inline: true
            },
            {
                name: `⚜️ | Level`,
                value: user.level,
                inline: true
            },
            {
                name: `🔰 | XP`,
                value: `${user.xp} / ${user.nextLevelXp}`,
                inline: true
            },
            {
                name: `💎 | ${t("commands:status.money")}`,
                value: user.money,
                inline: true
            },
            {
                name: `⚗️ | ${t("commands:status.ability")}`,
                value: user.uniquePower.name,
                inline: true
            }
            ])
        if (user.hasFamily) embed.addField(`🔱 | ${t("commands:status.family")}`, user.familyName, true)
        message.channel.send(message.author, embed)
    }
};
