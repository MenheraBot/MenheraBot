const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class FamiliaInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "infofamilia",
            aliases: ["if", "fi"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg"
        })
    }
    async run({ message, args, server }, t) {


        const validArgs = ["loki", "ares", "freya", "soma", "apolo"]

        if (!args[0] || !validArgs.includes(args[0].toLowerCase())) return message.channel.send(`${t("commands:infofamilia.invalid-args")}\`` + validArgs.join(", ") + "`")

        const minusculo = args[0].toLowerCase()
        const familyID = minusculo.charAt(0).toUpperCase() + minusculo.slice(1);

        const familia = await this.client.database.Familias.findById(familyID)

        let familyAbilities = await getFamilyAbilities(familia)
        let txt = "";

        familyAbilities.forEach(hab => {
            txt += `\n🧾 | **${t("commands:infofamilia.name")}:** ${hab.name}\n📜 | **${t("commands:infofamilia.desc")}:** ${hab.description}\n⚔️ | **${t("commands:infofamilia.damage")}:** ${hab.damage}\n💉 | **${t("commands:infofamilia.heal")}:** ${hab.heal}\n💧 | **${t("commands:infofamilia.cost")}:** ${hab.cost}\n`
        })

        let embed = new MessageEmbed()
            .setTitle(t("commands:infofamilia.embed.title", { family: familia._id }))
            .setColor('#01fa13')
            .setDescription(t("commands:infofamilia.embed.description", { level: familia.levelFamilia, next: familia.nextLevel }))
            .addFields([{
                name: '📤 | Boost',
                value: `${t("commands:infofamilia.name")}: **${familia.boost.name}**\n${t("commands:infofamilia.value")}: **${familia.boost.value}**`,
                inline: true
            },
            {
                name: `<:God:758474639570894899> | ${t("commands:infofamilia.embed.members")}`,
                value: familia.members.length,
                inline: true
            },
            {
                name: `:gem: | ${t("commands:infofamilia.embed.bank")}`,
                value: familia.bank,
                inline: true
            },
            {
                name: `🔮 | ${t("commands:infofamilia.embed.abilities")}`,
                value: txt,
                inline: false
            }
            ])
        message.channel.send(embed)
    }
}

async function getFamilyAbilities(familia) {
    let abilities = []
    familia.abilities.forEach(hab => {
        abilities.push(hab)
    })
    return abilities;
}