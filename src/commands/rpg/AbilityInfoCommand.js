const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const abilitiesFile = require("../../structures/RpgHandler").abiltiies
module.exports = class AbilityInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "infohabilidade",
            aliases: ["ih"],
            cooldown: 10,
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg"
        })
    }
    async run({ message, args, server }, t) {

        if (!args[0]) return message.menheraReply("question", t("commands:ih.no-args"))

        const validArgs = [{
            opção: "classe",
            arguments: ["classe", "class", "c"]
        },
        {
            opção: "minhas",
            arguments: ["minhas", "minha", "meu", "meus", "mine", "my"]
        }
        ]

        const selectedOption = validArgs.some(so => so.arguments.includes(args[0].toLowerCase()))
        if (!selectedOption) return message.menheraReply("error", t("commands:ih.invalid-option"))
        const filtredOption = validArgs.filter(f => f.arguments.includes(args[0].toLowerCase()))

        const option = filtredOption[0].opção

        switch (option) {
            case 'classe':
                if (!args[1]) return message.menheraReply("error", t("commands:ih.no-class"))
                this.getClass(message, args[1], t)
                break;
            case 'minhas':
                this.getAll(message, t)
                break
        }
    }
    getClass(message, classe, t) {

        const classes = ["assassino", "barbaro", "clerigo", "druida", "espadachim", "feiticeiro", "monge", "necromante"]

        const normalized = classe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!classes.includes(normalized)) return message.menheraReply("error", t("commands:ih.invalid-class"))

        let filtrado;

        switch (normalized) {
            case 'assassino':
                filtrado = abilitiesFile.assassin
                break;
            case 'barbaro':
                filtrado = abilitiesFile.barbarian
                break;
            case 'clerigo':
                filtrado = abilitiesFile.clerigo
                break;
            case 'druida':
                filtrado = abilitiesFile.druida
                break;
            case 'espadachim':
                filtrado = abilitiesFile.espadachim
                break;
            case 'feiticeiro':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'monge':
                filtrado = abilitiesFile.monge
                break;
            case 'necromante':
                filtrado = abilitiesFile.necromante
                break;
        }

        const filtredOption = filtrado.uniquePowers

        let embed = new MessageEmbed()
            .setTitle(`🔮 | ${t("commands:ih.abilities", { class: classe })}`)
            .setColor('#9cfcde')

        filtredOption.forEach(hab => {
            embed.addField(hab.name, `📜 | **${t("commands:ih.desc")}:** ${hab.description}\n⚔️ | **${t("commands:ih.dmg")}:** ${hab.damage}\n💉 | **${t("commands:ih.heal")}:** ${hab.heal}\n💧 | **${t("commands:ih.cost")}:** ${hab.cost}\n🧿 | **${t("commands:ih.type")}:** ${hab.type}`)
        })

        message.channel.send(message.author, embed)

    }
    async getAll(message, t) {

        const user = await this.client.database.Rpg.findById(message.author.id)
        if (!user) return message.menheraReply("error", t("commands:ih.non-aventure"))

        let filtrado;

        switch (user.class) {
            case 'Assassino':
                filtrado = abilitiesFile.assassin
                break;
            case 'Bárbaro':
                filtrado = abilitiesFile.barbarian
                break;
            case 'Clérigo':
                filtrado = abilitiesFile.clerigo
                break;
            case 'Druida':
                filtrado = abilitiesFile.druida
                break;
            case 'Espadachim':
                filtrado = abilitiesFile.espadachim
                break;
            case 'Feiticeiro':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'Monge':
                filtrado = abilitiesFile.monge
                break;
            case 'Necromante':
                filtrado = abilitiesFile.necromante
                break;
        }

        let uniquePowerFiltred = filtrado.uniquePowers.filter(f => f.name == user.uniquePower.name)
        let abilitiesFiltred = [];

        user.abilities.forEach(hab => {
            let a = filtrado.normalAbilities.filter(f => f.name == hab.name)
            abilitiesFiltred.push(a[0])
        })

        let embed = new MessageEmbed()
            .setTitle(`🔮 | ${t("commands:ih.your-abilities")}`)
            .setColor('#a9ec67')

        embed.addField(` ${t("commands:ih.uniquePower")}: ` + uniquePowerFiltred[0].name, `📜 | **${t("commands:ih.desc")}:** ${uniquePowerFiltred[0].description}\n⚔️ | **${t("commands:ih.dmg")}:** ${uniquePowerFiltred[0].damage}\n💉 | **${t("commands:ih.heal")}:** ${uniquePowerFiltred[0].heal}\n💧 | **${t("commands:ih.cost")}:** ${uniquePowerFiltred[0].cost}`)

        abilitiesFiltred.forEach(hab => {
            embed.addField(`🔮 | ${t("commands:ih.ability")}: ` + hab.name, `📜 | **${t("commands:ih.desc")}:** ${hab.description}\n⚔️ | **${t("commands:ih.dmg")}:** ${hab.damage}\n💉 | **${t("commands:ih.heal")}:** ${hab.heal}\n💧 | **${t("commands:ih.cost")}:** ${hab.cost}`)
        })

        if (user.hasFamily) {
            const familia = await this.client.database.Familias.findById(user.familyName)
            familia.abilities.forEach(hab => {
                embed.addField(`🔮 | ${t("commands:ih.familyAbility")}: ` + hab.name, `📜 | **${t("commands:ih.desc")}:** ${hab.description}\n⚔️ | **${t("commands:ih.dmg")}:** ${hab.damage}\n💉 | **${t("commands:ih.heal")}:** ${hab.heal}\n💧 | **${t("commands:ih.cost")}:** ${hab.cost}`)
            })
        }
        message.channel.send(message.author, embed)
    }
};
