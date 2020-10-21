const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class FamiliaInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "infofamilia",
            aliases: ["if"],
            cooldown: 5,
            description: "Veja as informações de uma família",
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg",
            usage: "<familia>"
        })
    }
    async run(message, args) {


        const validArgs = ["loki", "ares", "freya", "soma", "apolo"]

        if (!args[0] || !validArgs.includes(args[0].toLowerCase())) return message.channel.send("<:negacao:759603958317711371> | Esta família não existe!\nFamílias disponíveis: `" + validArgs.join(", ") + "`")

        const minusculo = args[0].toLowerCase()
        const familyID = minusculo.charAt(0).toUpperCase() + minusculo.slice(1);

        const familia = await this.client.database.Familias.findById(familyID)

        let familyAbilities = await getFamilyAbilities(familia)
        let txt = "";

        familyAbilities.forEach(hab => {
            txt += `\n🧾 | **Nome:** ${hab.name}\n📜 | **Descrição:** ${hab.description}\n⚔️ | **Dano:** ${hab.damage}\n💉 | **Cura:** ${hab.heal}\n💧 | **Custo:** ${hab.cost}\n`
        })

        let embed = new MessageEmbed()
            .setTitle(`Informações da família ${familia._id}`)
            .setColor('#01fa13')
            .setDescription(`**Nível da Família: ${familia.levelFamilia}**\nGemas necessárias para o próximo nível: **${familia.nextLevel}** :gem:`)
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