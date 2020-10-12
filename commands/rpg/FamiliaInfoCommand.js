const {
    MessageEmbed
} = require("discord.js");
const database = require("../../models/rpg")
const familyDb = require("../../models/familia");
const rpg = require("../../models/rpg");
module.exports = {
    name: "infofamilia",
    aliases: ["familiainfo", "if"],
    cooldown: 3,
    category: "rpg",
    dir: 'FamiliaInfoCommand',
    description: "Veja as informações de uma família",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!if <família>",
    run: async (client, message, args) => {

        const validArgs = ["loki", "ares", "freya", "soma", "apolo"]

        if (!args[0] || !validArgs.includes(args[0].toLowerCase())) return message.channel.send("<:negacao:759603958317711371> | Esta família não existe!\nFamílias disponíveis: `" + validArgs.join(", ") + "`")

        const familyID = args[0].charAt(0).toUpperCase() + args[0].slice(1);

        const familia = await familyDb.findById(familyID)

        let familyAbilities = await getFamilyAbilities(familia)
        let txt = "";

        familyAbilities.forEach(hab => {
            txt += `\n🧾 | **Nome:** ${hab.name}\n📜 | **Descrição:** ${hab.description}\n⚔️ | **Dano:** ${hab.damage}\n💉 | **Cura:** ${hab.heal}\n💧 | **Custo:** ${hab.cost}\n`
        })

        let embed = new MessageEmbed()
            .setTitle(`Informações da família ${familia._id}`)
            .setColor('#01fa13')
            .addFields([{
                    name: '📤 | Boost',
                    value: `Nome: **${familia.boost.name}**\nValor: **${familia.boost.value}**`,
                    inline: true
                },
                {
                    name: '<:God:758474639570894899> | Membros',
                    value: familia.members.length,
                    inline: true
                },
                {
                    name: ':gem: | Banco da Família',
                    value: familia.bank,
                    inline: true
                },
                {
                    name: "🔮 | Habilidades Liberadas",
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
