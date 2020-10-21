const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class StatusCommand extends Command {
    constructor(client) {
        super(client, {
            name: "status",
            aliases: ["stats"],
            cooldown: 5,
            description: "Veja os status de alguém",
            category: "rpg",
            clientPermissions: ["EMBED_LINKS"],
            usage: "[usuário]"
        })
    }
    async run(message, args) {

        let mentioned = message.mentions.users.first() || this.client.users.cache.get(args[0]);
        if (!mentioned) mentioned = message.author;

        const user = await this.client.database.Rpg.findById(mentioned.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Este usuário não está registrado como um aventureiro")

        let dmg = `${user.damage} + ${user.weapon.damage}`
        let ptr = `${user.armor} + ${user.protection.armor}`

        let familia

        if (user.hasFamily) {
            familia = await this.client.database.Familias.findById(user.familyName)
            if (user.familyName === "Loki ") dmg = `${user.damage} + ${user.weapon.damage} + \`${familia.boost.value}\``
            if (user.familyName === "Ares") ptr = `${user.armor} + ${user.protection.armor} + ${familia.boost.value}`
        }

        let embed = new MessageEmbed()
            .setTitle(`📜 | Status de ${mentioned.username}`)
            .setColor('#f04682')
            .addFields([{
                name: `🩸 | Vida`,
                value: user.life + '/' + user.maxLife,
                inline: true
            },
            {
                name: `⚔️ | Classe`,
                value: user.class,
                inline: true
            },
            {
                name: `🛡️ | Armadura`,
                value: ptr,
                inline: true
            },
            {
                name: `🗡️ | Dano Físico`,
                value: dmg,
                inline: true
            }, {
                name: `💧 | Mana`,
                value: user.mana + '/' + user.maxMana,
                inline: true
            },
            {
                name: `🔮 | Poder Mágico`,
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
                name: `💎 | Pedras Magicas`,
                value: user.money,
                inline: true
            },
            {
                name: `⚗️ | Habilidade Única`,
                value: user.uniquePower.name,
                inline: true
            }
            ])
        if (user.hasFamily) embed.addField(`🔱 | Família`, user.familyName, true)
        message.channel.send(message.author, embed)
    }
};
